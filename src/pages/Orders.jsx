import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChefHat,
  MapPin,
  Banknote,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  Pending: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock size={16} />,
  },
  Confirmed: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 size={16} />,
  },
  Delivered: {
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={16} />,
  },
  Cancelled: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle size={16} />,
  },
};

const TRACKING_STEPS = [
  { key: "Pending", label: "Order Placed", icon: Package },
  { key: "Confirmed", label: "Confirmed", icon: ChefHat },
  { key: "Delivered", label: "Delivered", icon: MapPin },
];

function OrderTracker({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <XCircle size={24} className="text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500">
            This order has been cancelled. Contact support for help.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full -z-0" />
        {/* Active progress line */}
        <div
          className="absolute top-5 left-0 h-1 bg-primary-500 rounded-full -z-0 transition-all duration-500"
          style={{
            width:
              currentIndex === -1
                ? "0%"
                : currentIndex === 0
                ? "15%"
                : currentIndex === 1
                ? "50%"
                : "100%",
          }}
        />
        {TRACKING_STEPS.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2 z-10 bg-white px-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? isCurrent
                      ? "bg-primary-500 border-primary-500 text-white ring-4 ring-primary-100"
                      : "bg-primary-500 border-primary-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(user.uid);
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500 mb-6">
            Your order history will appear here.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Package size={24} className="text-primary-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}
                    >
                      {status.icon}
                      {order.status}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{order.totalPrice?.toFixed(2)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Order Tracking */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                          Order Tracking
                        </h3>
                        <OrderTracker status={order.status} />
                      </div>

                      {/* Status History — shows admin actions */}
                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                            Status History
                          </h3>
                          <div className="relative border-l-2 border-primary-200 ml-3 space-y-4">
                            {order.statusHistory.map((entry, idx) => {
                              const isLast = idx === order.statusHistory.length - 1;
                              const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Pending;
                              return (
                                <div key={idx} className="relative pl-6">
                                  {/* Timeline dot */}
                                  <span
                                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                                      isLast ? "bg-primary-500 ring-2 ring-primary-200" : "bg-primary-300"
                                    }`}
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{cfg.icon}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {entry.status}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-auto">
                                      {new Date(entry.timestamp).toLocaleString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {entry.status === "Pending" && "Order placed"}
                                    {entry.status === "Confirmed" && "Order confirmed by admin"}
                                    {entry.status === "Delivered" && "Order delivered successfully"}
                                    {entry.status === "Cancelled" && "Order cancelled by admin"}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Items
                      </h3>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                                {item.quantity}x
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ₹{item.price} each
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-700">
                              ₹{(
                                (item.price +
                                  (item.addons || []).reduce((s, a) => s + (a.price || 0), 0) +
                                  (item.seasonings || []).reduce((s, se) => s + (se.price || 0), 0)) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                          {/* Addons */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="ml-13 pl-7 mt-1 flex flex-wrap gap-1">
                              {item.addons.map((addon, aidx) => (
                                <span
                                  key={aidx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md"
                                >
                                  {addon.name}
                                  {(addon.price || 0) > 0 && <span>+₹{addon.price}</span>}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Seasonings */}
                          {item.seasonings && item.seasonings.length > 0 && (
                            <div className="ml-13 pl-7 mt-1 flex flex-wrap gap-1">
                              {item.seasonings.map((seasoning, sidx) => (
                                <span
                                  key={sidx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-md"
                                >
                                  {seasoning.name}
                                  {(seasoning.price || 0) > 0 && <span>+₹{seasoning.price}</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          {order.paymentMethod === "upi" ? (
                            <>
                              <Smartphone size={14} className="text-primary-500" />
                              UPI / Online
                            </>
                          ) : (
                            <>
                              <Banknote size={14} className="text-primary-500" />
                              Cash on Delivery
                            </>
                          )}
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-gray-600">Total</span>
                        <span className="text-xl font-bold text-primary-600">
                          ₹{order.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

