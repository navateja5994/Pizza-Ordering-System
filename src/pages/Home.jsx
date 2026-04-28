import { useEffect, useState } from "react";
import { foodService } from "../services/foodService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Pizza,
  SlidersHorizontal,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const MOCK_FOODS = [
  { id: "m1", name: "Margherita Pizza", price: 299, category: "Pizza", image: ""},
  { id: "m2", name: "Pepperoni Pizza", price: 399, category: "Pizza", image: "" },
  { id: "m3", name: "BBQ Chicken Pizza", price: 449, category: "Pizza", image: "" },
  { id: "m4", name: "Veggie Supreme Pizza", price: 349, category: "Pizza", image: ""},
  { id: "m5", name: "Cheese Burger", price: 199, category: "Burger", image: "" },
  { id: "m6", name: "Chicken Burger", price: 249, category: "Burger", image: ""},
  { id: "m7", name: "Double Patty Burger", price: 349, category: "Burger", image: "" },
  { id: "m8", name: "Creamy Alfredo Pasta", price: 299, category: "Pasta", image: "" },
  { id: "m9", name: "Arrabbiata Pasta", price: 279, category: "Pasta", image: "" },
  { id: "m10", name: "Garlic Bread", price: 149, category: "Sides", image: ""},
  { id: "m11", name: "French Fries", price: 99, category: "Sides", image: "" },
  { id: "m12", name: "Chicken Wings (6 pcs)", price: 249, category: "Sides", image: "" },
  { id: "m13", name: "Coke 500ml", price: 49, category: "Drinks", image: "" },
  { id: "m14", name: "Lemon Iced Tea", price: 79, category: "Drinks", image: ""},
  { id: "m15", name: "Chocolate Lava Cake", price: 149, category: "Dessert", image: "" },
  { id: "m16", name: "New York Cheesecake", price: 199, category: "Dessert", image: ""},
];

const CATEGORIES = ["All", "Pizza", "Burger", "Pasta", "Sides", "Drinks", "Dessert"];

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [useMockData, setUseMockData] = useState(false);

  // Addon modal state
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedSeasonings, setSelectedSeasonings] = useState([]);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const data = await foodService.getAll();
      // Normalize: ensure addons and seasonings are always arrays
      const normalized = data.map((f) => ({
        ...f,
        addons: Array.isArray(f.addons) ? f.addons : [],
        seasonings: Array.isArray(f.seasonings) ? f.seasonings : [],
      }));
      if (normalized.length === 0) {
        setFoods(MOCK_FOODS);
        setUseMockData(true);
      } else {
        setFoods(normalized);
        setUseMockData(false);
      }
      const initialQty = {};
      (normalized.length > 0 ? normalized : MOCK_FOODS).forEach((f) => (initialQty[f.id] = 1));
      setQuantities(initialQty);
    } catch (err) {
      setFoods(MOCK_FOODS);
      setUseMockData(true);
      const initialQty = {};
      MOCK_FOODS.forEach((f) => (initialQty[f.id] = 1));
      setQuantities(initialQty);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (foodId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: Math.max(1, (prev[foodId] || 1) + delta),
    }));
  };

  const openAddonModal = (food) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setSelectedFood(food);
    setSelectedAddons([]);
    setSelectedSeasonings([]);
    setAddonModalOpen(true);
  };

  const closeAddonModal = () => {
    setAddonModalOpen(false);
    setSelectedFood(null);
    setSelectedAddons([]);
    setSelectedSeasonings([]);
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      }
      return [...prev, addon];
    });
  };

  const toggleSeasoning = (seasoning) => {
    setSelectedSeasonings((prev) => {
      const exists = prev.find((s) => s.name === seasoning.name);
      if (exists) {
        return prev.filter((s) => s.name !== seasoning.name);
      }
      return [...prev, seasoning];
    });
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedFood) return;
    try {
      await addToCart(selectedFood, quantities[selectedFood.id] || 1, selectedAddons, selectedSeasonings);
      toast.success(`${selectedFood.name} added to cart!`);
      setQuantities((prev) => ({ ...prev, [selectedFood.id]: 1 }));
      closeAddonModal();
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    }
  };

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const seasoningTotal = selectedSeasonings.reduce((sum, s) => sum + s.price, 0);
  const itemTotal = selectedFood
    ? (selectedFood.price + addonTotal + seasoningTotal) * (quantities[selectedFood.id] || 1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Delicious Food, Delivered
        </h1>
        <p className="text-gray-500 text-lg">
          Browse our menu and order your favorites
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <SlidersHorizontal size={20} />
          <span className="text-sm font-medium">Filters</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20">
          <Pizza size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-primary-100 to-orange-50 flex items-center justify-center relative">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                ) : (
                  <Pizza size={64} className="text-primary-300" />
                )}
                {food.category && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                    {food.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{food.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-4">₹{food.price}</p>

                {/* Addons hint */}
                {(food.addons?.length > 0 || food.seasonings?.length > 0) && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Sparkles size={12} className="text-primary-400" />
                    <span>
                      {food.addons?.length || 0} add-ons
                      {food.seasonings?.length > 0 && `, ${food.seasonings.length} seasonings`}
                    </span>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(food.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {quantities[food.id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(food.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => openAddonModal(food)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:scale-95 transition-all font-medium text-sm"
                  >
                    <ShoppingCart size={16} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Addon Selection Modal */}
      {addonModalOpen && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedFood.name}</h3>
                <p className="text-sm text-gray-500">Customize your order</p>
              </div>
              <button
                onClick={closeAddonModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => handleQuantityChange(selectedFood.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">
                    {quantities[selectedFood.id] || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(selectedFood.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Addons */}
              {selectedFood.addons && selectedFood.addons.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary-500" />
                    Add-ons
                  </h4>
                  <div className="space-y-2">
                    {selectedFood.addons.map((addon, idx) => {
                      const isSelected = selectedAddons.find((a) => a.name === addon.name);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleAddon(addon)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-primary-500 bg-primary-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm ${
                                isSelected ? "text-primary-700" : "text-gray-900"
                              }`}
                            >
                              {addon.name}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? "text-primary-600" : "text-gray-500"
                            }`}
                          >
                            {addon.price === 0 ? "Free" : `+₹${addon.price}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seasonings */}
              {selectedFood.seasonings && selectedFood.seasonings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-orange-500" />
                    Seasonings
                  </h4>
                  <div className="space-y-2">
                    {selectedFood.seasonings.map((seasoning, idx) => {
                      const isSelected = selectedSeasonings.find((s) => s.name === seasoning.name);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleSeasoning(seasoning)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm ${
                                isSelected ? "text-orange-700" : "text-gray-900"
                              }`}
                            >
                              {seasoning.name}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? "text-orange-600" : "text-gray-500"
                            }`}
                          >
                            {seasoning.price === 0 ? "Free" : `+₹${seasoning.price}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!selectedFood.addons || selectedFood.addons.length === 0) &&
                (!selectedFood.seasonings || selectedFood.seasonings.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No add-ons or seasonings available for this item
                </p>
              )}

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Price</span>
                  <span>₹{selectedFood.price} × {quantities[selectedFood.id] || 1}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Add-ons</span>
                    <span>+₹{addonTotal} × {quantities[selectedFood.id] || 1}</span>
                  </div>
                )}
                {selectedSeasonings.length > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Seasonings</span>
                    <span>+₹{seasoningTotal} × {quantities[selectedFood.id] || 1}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">₹{itemTotal}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={handleConfirmAddToCart}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:scale-95 transition-all font-medium"
              >
                <ShoppingCart size={18} />
                Add to Cart — ₹{itemTotal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

