import { useState, useEffect } from "react";
import { foodService } from "../services/foodService";
import { X, Save, Plus, ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["Pizza", "Burger", "Pasta", "Sides", "Drinks", "Dessert"];

export default function AddFood({ food, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Pizza",
    image: "",
    addons: [],
    seasonings: [],
  });
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  const [newSeasoningName, setNewSeasoningName] = useState("");
  const [newSeasoningPrice, setNewSeasoningPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!food;

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name || "",
        price: food.price?.toString() || "",
        category: food.category || "Pizza",
        image: food.image || "",
        addons: food.addons || [],
        seasonings: food.seasonings || [],
      });
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAddon = () => {
    if (!newAddonName.trim()) {
      toast.error("Please enter an addon name");
      return;
    }
    const price = parseFloat(newAddonPrice) || 0;
    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, { name: newAddonName.trim(), price }],
    }));
    setNewAddonName("");
    setNewAddonPrice("");
  };

  const removeAddon = (index) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  const addSeasoning = () => {
    if (!newSeasoningName.trim()) {
      toast.error("Please enter a seasoning name");
      return;
    }
    const price = parseFloat(newSeasoningPrice) || 0;
    setFormData((prev) => ({
      ...prev,
      seasonings: [...prev.seasonings, { name: newSeasoningName.trim(), price }],
    }));
    setNewSeasoningName("");
    setNewSeasoningPrice("");
  };

  const removeSeasoning = (index) => {
    setFormData((prev) => ({
      ...prev,
      seasonings: prev.seasonings.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price),
      };
      if (isEditing) {
        await foodService.update(food.id, dataToSave);
        toast.success("Food item updated successfully");
      } else {
        await foodService.create(dataToSave);
        toast.success("Food item added successfully");
      }
      setFormData({ name: "", price: "", category: "Pizza", image: "", addons: [], seasonings: [] });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? "Edit Food Item" : "Add New Food Item"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Margherita Pizza"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 299"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <div className="relative">
            <ImageIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Addons Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add-ons
          </label>

          {/* Existing Addons */}
          {formData.addons.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.addons.map((addon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {addon.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {addon.price === 0 ? "Free" : `+₹${addon.price}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddon(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Addon */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              placeholder="Addon name (e.g. Extra Cheese)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              value={newAddonPrice}
              onChange={(e) => setNewAddonPrice(e.target.value)}
              placeholder="Price"
              min="0"
              className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={addAddon}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Seasonings Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seasonings
          </label>

          {/* Existing Seasonings */}
          {formData.seasonings.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.seasonings.map((seasoning, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {seasoning.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {seasoning.price === 0 ? "Free" : `+₹${seasoning.price}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSeasoning(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Seasoning */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSeasoningName}
              onChange={(e) => setNewSeasoningName(e.target.value)}
              placeholder="Seasoning name (e.g. Oregano)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              value={newSeasoningPrice}
              onChange={(e) => setNewSeasoningPrice(e.target.value)}
              placeholder="Price"
              min="0"
              className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={addSeasoning}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}
            {isEditing ? "Update" : "Add"} Food
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

