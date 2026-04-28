import { useEffect, useState } from "react";
import { foodService } from "../services/foodService";
import { orderService } from "../services/orderService";
import { seedService } from "../services/seedService";
import { adminRequestService } from "../services/adminRequestService";
import { useAuth } from "../context/AuthContext";
import AddFood from "./AddFood";
import {
  Package,
  UtensilsCrossed,
  TrendingUp,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
  Plus,
  Database,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_FLOW = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const STATUS_CONFIG = {
  Pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock size={14} /> },
  Confirmed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} /> },
  Delivered: { color: "bg-green-50 text-green-700 border-green-200", icon: <Truck size={14} /> },
  Cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle size={14} /> },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "pending_admins") {
      loadPendingAdmins();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, foodsData] = await Promise.all([
        orderService.getAllOrders(),
        foodService.getAll(),
      ]);
      setOrders(ordersData);
      setFoods(foodsData);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAdmins = async () => {
    try {
      setLoading(true);
      const requests = await adminRequestService.getAllPending();
      setPendingAdmins(requests);
    } catch (err) {
      toast.error("Failed to load pending admin requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (uid, token) => {
    try {
      await adminRequestService.approve(uid, token);
      toast.success("Admin approved successfully");
      await loadPendingAdmins();
    } catch (err) {
      toast.error(err.message || "Failed to approve admin");
    }
  };

  const handleRejectAdmin = async (uid, token) => {
    if (!window.confirm("Are you sure you want to reject this admin request?")) return;
    try {
      await adminRequestService.reject(uid, token);
      toast.success("Admin request rejected");
      await loadPendingAdmins();
    } catch (err) {
      toast.error(err.message || "Failed to reject admin");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await seedService.seedFoods();
      await loadData();
      toast.success("Sample food items loaded!");
    } catch (err) {
      toast.error("Failed to load sample data. Check Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedOrders = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    try {
      setLoading(true);
      await seedService.seedOrders(user.uid);
      await loadData();
      toast.success("Sample orders loaded!");
    } catch (err) {
      toast.error("Failed to load sample orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await foodService.delete(foodId);
      setFoods((prev) => prev.filter((f) => f.id !== foodId));
      toast.success("Food item deleted");
    } catch (err) {
      toast.error("Failed to delete food item");
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

  // Stats
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const totalFoods = foods.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Total Orders</span>
            <Package size={20} className="text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Revenue</span>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Pending</span>
            <Clock size={20} className="text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Menu Items</span>
            <UtensilsCrossed size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalFoods}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === "orders"
              ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => {
            setActiveTab("foods");
            setShowAddForm(false);
            setEditingFood(null);
          }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === "foods"
              ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
              : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
          }`}
        >
          Food Items
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No orders found</p>
              <button
                onClick={handleSeedOrders}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                <ShoppingBag size={18} />
                Load Sample Orders
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
              const isExpanded = expandedOrder === order.id;
              const nextStatuses = STATUS_FLOW[order.status] || [];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
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

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="pt-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Order Items
                        </h3>
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2"
                          >
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
                                {(item.addons?.length > 0 || item.seasonings?.length > 0) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(item.addons || []).map((addon, aidx) => (
                                      <span
                                        key={`a-${aidx}`}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-md"
                                      >
                                        {addon.name}
                                        {(addon.price || 0) > 0 && <span>+₹{addon.price}</span>}
                                      </span>
                                    ))}
                                    {(item.seasonings || []).map((seasoning, sidx) => (
                                      <span
                                        key={`s-${sidx}`}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-md"
                                      >
                                        {seasoning.name}
                                        {(seasoning.price || 0) > 0 && <span>+₹{seasoning.price}</span>}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="font-medium text-gray-700">
                              ₹{((item.price +
                                (item.addons || []).reduce((s, a) => s + (a.price || 0), 0) +
                                (item.seasonings || []).reduce((s, se) => s + (se.price || 0), 0)) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}

                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                          <span className="text-gray-600">Total</span>
                          <span className="text-xl font-bold text-primary-600">
                            ₹{order.totalPrice?.toFixed(2)}
                          </span>
                        </div>

                        {/* Status Actions */}
                        {nextStatuses.length > 0 && (
                          <div className="pt-3 flex gap-2">
                            {nextStatuses.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                onClick={() =>
                                  handleUpdateStatus(order.id, nextStatus)
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  nextStatus === "Cancelled"
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                                }`}
                              >
                                Mark as {nextStatus}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Foods Tab */}
      {activeTab === "foods" && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(showAddForm || editingFood) && (
            <AddFood
              food={editingFood}
              onClose={() => {
                setShowAddForm(false);
                setEditingFood(null);
              }}
              onSuccess={() => {
                loadData();
                setShowAddForm(false);
                setEditingFood(null);
              }}
            />
          )}

          {/* Add Button */}
          {!showAddForm && !editingFood && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Food Item
            </button>
          )}

          {/* Food List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-orange-50 flex items-center justify-center shrink-0">
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <UtensilsCrossed size={24} className="text-primary-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {food.name}
                  </h3>
                  <p className="text-sm text-gray-500">{food.category}</p>
                  <p className="font-bold text-primary-600">₹{food.price}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingFood(food)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {foods.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <UtensilsCrossed size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No food items yet</p>
              <button
                onClick={handleSeedData}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <Database size={18} />
                Load Sample Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pending Admins Tab */}
      {activeTab === "pending_admins" && (
        <div className="space-y-4">
          {pendingAdmins.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No pending admin requests</p>
            </div>
          ) : (
            pendingAdmins.map((request) => (
              <div
                key={request.uid}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{request.name}</p>
                    <p className="text-sm text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400">
                      Requested on {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveAdmin(request.uid, request.approvalToken)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                  >
                    <UserCheck size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectAdmin(request.uid, request.approvalToken)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    <UserX size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

