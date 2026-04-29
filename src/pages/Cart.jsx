import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  PackageOpen,
  Banknote,
  Smartphone,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Banknote,
  },
  {
    id: "upi",
    label: "UPI / Online Payment",
    description: "Pay securely via UPI or card",
    icon: Smartphone,
  },
];

export default function Cart() {
  const { items, loading, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);
      await orderService.create({
        userId: user.uid,
        items: items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          addons: i.addons || [],
          seasonings: i.seasonings || [],
        })),
        totalPrice,
        paymentMethod,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <PackageOpen size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-orange-50 flex items-center justify-center shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <ShoppingBag size={28} className="text-primary-300" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  {item.addons && item.addons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-1">
                      {item.addons.map((addon, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md"
                        >
                          {addon.name}
                          {addon.price > 0 && <span>+₹{addon.price}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.seasonings && item.seasonings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-1">
                      {item.seasonings.map((seasoning, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-md"
                        >
                          {seasoning.name}
                          {seasoning.price > 0 && <span>+₹{seasoning.price}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    ₹{item.price} each
                  </p>
                  <p className="font-bold text-primary-600">
                    ₹{(
                      (item.price +
                        (item.addons || []).reduce((s, a) => s + a.price, 0) +
                        (item.seasonings || []).reduce((s, se) => s + se.price, 0)) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeFromCart(item.id)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.length})</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              isSelected ? "text-primary-700" : "text-gray-900"
                            }`}
                          >
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-primary-500 bg-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* UPI QR Code */}
                {paymentMethod === "upi" && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Scan QR to pay via UPI
                    </p>
                    <img
                      src="/Qr.jpg"
                      alt="UPI QR Code"
                      className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      After payment, click Place Order
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {placingOrder ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 py-2 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

