import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { DataContext } from "../../context/ProductContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../config/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox,
  FaCalendarAlt,
  FaDollarSign,
  FaShoppingCart,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaSort,
  FaUser,
  FaMapMarkerAlt,
  FaPrint,
  FaDownload,
  FaShare,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

const AdminOrderManager = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { products } = useContext(DataContext);
  const { token, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const validStatuses = useMemo(
    () => ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
    []
  );

  const handleAuthError = useCallback(() => {
    toast.error("Session expired. Please login again.");
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const fetchOrders = useCallback(async () => {
    setFetchLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !hasRole("ADMIN")) {
        throw new Error("Unauthorized access");
      }

      const response = await axios.get(`${API_URL}/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.orders || response.data || [];
      setOrders(
        (Array.isArray(data) ? data : []).map((order) => ({
          ...order,
          totalAmount: Number(order.totalAmount || 0),
          subtotalAmount: Number(order.subtotalAmount || 0),
          shippingCost: Number(order.shippingCost || 0),
          taxAmount: Number(order.taxAmount || 0),
          createdAt: new Date(order.createdAt),
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      }
    } finally {
      setFetchLoading(false);
    }
  }, [isAuthenticated, token, hasRole, handleAuthError]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!validStatuses.includes(newStatus)) {
      toast.error("Invalid order status");
      return;
    }

    // Find the current order to check status change
    const currentOrder = orders.find(order => order.id === orderId);
    const oldStatus = currentOrder?.status;

    setUpdateLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );

      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...updatedOrder,
                totalAmount: Number(updatedOrder.totalAmount || 0),
                subtotalAmount: Number(updatedOrder.subtotalAmount || 0),
                shippingCost: Number(updatedOrder.shippingCost || 0),
                taxAmount: Number(updatedOrder.taxAmount || 0),
                createdAt: new Date(updatedOrder.createdAt),
              }
            : order
        )
      );
      
      // Show revenue impact notification
      if (oldStatus !== newStatus) {
        const orderAmount = currentOrder?.totalAmount || 0;
        if (oldStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
          toast.warning(`Order cancelled. Revenue reduced by ₹${orderAmount.toFixed(2)}`, {
            autoClose: 5000,
          });
        } else if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
          toast.success(`Order reactivated. Revenue increased by ₹${orderAmount.toFixed(2)}`, {
            autoClose: 5000,
          });
        } else {
          toast.success("Status updated successfully");
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 404) {
        toast.error("Order not found.");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        handleAuthError();
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update order status"
        );
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !hasRole("ADMIN")) {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [fetchOrders, isAuthenticated, hasRole, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <FaBox className="h-5 w-5" />;
      case "SHIPPED":
        return <FaTruck className="h-5 w-5" />;
      case "DELIVERED":
        return <FaCheckCircle className="h-5 w-5" />;
      case "CANCELLED":
        return <FaTimesCircle className="h-5 w-5" />;
      default:
        return <FaBox className="h-5 w-5" />;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          order.id.toString().includes(searchTerm) ||
          order.userId.toString().includes(searchTerm);
        const matchesStatus =
          filterStatus === "ALL" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return b.createdAt - a.createdAt;
          case "oldest":
            return a.createdAt - b.createdAt;
          case "highest":
            return b.totalAmount - a.totalAmount;
          case "lowest":
            return a.totalAmount - b.totalAmount;
          default:
            return 0;
        }
      });
  }, [orders, searchTerm, filterStatus, sortBy]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("Download functionality coming soon!");
  };

  const handleShare = () => {
    toast.info("Share functionality coming soon!");
  };

  if (fetchLoading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`pt-16 min-h-screen relative overflow-hidden ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDarkMode ? "bg-purple-500" : "bg-sky-400"
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDarkMode ? "bg-sky-500" : "bg-purple-400"
        }`} />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className={`p-4 rounded-2xl backdrop-blur-md border shadow-2xl ${
                isDarkMode 
                  ? "bg-white/10 border-white/20 shadow-purple-500/20" 
                  : "bg-white/70 border-white/50 shadow-sky-500/20"
              }`}>
                <FaShoppingCart className={`w-8 h-8 ${
                  isDarkMode ? "text-sky-400" : "text-sky-600"
                }`} />
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? "from-sky-400 via-purple-400 to-sky-400" 
                    : "from-sky-600 via-purple-600 to-sky-600"
                }`}>
                  Admin Order Management
                </h1>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  Manage and track all orders with advanced analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/dashboard")}
                className={`px-6 py-3 rounded-xl font-medium backdrop-blur-md border transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50 text-white hover:from-slate-700/80 hover:to-slate-600/80"
                    : "bg-gradient-to-r from-white/80 to-slate-50/80 border-slate-200/50 text-slate-700 hover:from-white/90 hover:to-slate-50/90"
                }`}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl backdrop-blur-md border bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 flex items-center shadow-lg"
            >
              <FaExclamationTriangle className="mr-3 text-lg" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-6 mb-8 backdrop-blur-md border shadow-2xl ${
              isDarkMode 
                ? "bg-white/5 border-white/10 shadow-purple-500/10" 
                : "bg-white/70 border-white/50 shadow-sky-500/10"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDarkMode ? "text-slate-400 group-focus-within:text-sky-400" : "text-slate-500 group-focus-within:text-sky-600"
                }`} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-sky-400/50"
                      : "bg-white/50 border-white/30 text-slate-900 placeholder-slate-500 focus:bg-white/70 focus:border-sky-500/50"
                  } focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-lg`}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-lg ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-sky-400/50"
                    : "bg-white/50 border-white/30 text-slate-900 focus:bg-white/70 focus:border-sky-500/50"
                } focus:outline-none focus:ring-2 focus:ring-sky-500/20`}
              >
                <option value="ALL">All Status</option>
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-lg ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-sky-400/50"
                    : "bg-white/50 border-white/30 text-slate-900 focus:bg-white/70 focus:border-sky-500/50"
                } focus:outline-none focus:ring-2 focus:ring-sky-500/20`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </motion.div>

          {/* Orders Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <div className={`rounded-2xl backdrop-blur-md border shadow-2xl overflow-hidden ${
              isDarkMode 
                ? "bg-white/5 border-white/10 shadow-purple-500/10" 
                : "bg-white/70 border-white/50 shadow-sky-500/10"
            }`}>
              <table className="min-w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-300" 
                      : "bg-white/50 border-white/30 text-slate-700"
                  }`}>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">Order ID</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">User ID</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">Total</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b transition-all duration-300 hover:backdrop-blur-lg ${
                          isDarkMode 
                            ? "border-white/5 hover:bg-white/5" 
                            : "border-white/20 hover:bg-white/30"
                        }`}
                      >
                        <td className={`py-4 px-6 font-medium ${
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        }`}>
                          #{order.id}
                        </td>
                        <td className={`py-4 px-6 ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}>
                          {order.userId}
                        </td>
                        <td className={`py-4 px-6 ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}>
                          {order.createdAt.toLocaleDateString()}
                        </td>
                        <td className={`py-4 px-6 font-semibold ${
                          isDarkMode ? "text-sky-400" : "text-sky-600"
                        }`}>
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDetails(order)}
                              className={`p-2 rounded-lg backdrop-blur-md border transition-all duration-300 ${
                                isDarkMode
                                  ? "bg-sky-500/20 border-sky-500/30 text-sky-400 hover:bg-sky-500/30"
                                  : "bg-sky-500/10 border-sky-500/20 text-sky-600 hover:bg-sky-500/20"
                              }`}
                              title="View details"
                            >
                              <FaSearch className="w-4 h-4" />
                            </motion.button>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value)
                              }
                              className={`text-sm rounded-lg border transition-all duration-300 px-3 py-1.5 ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600 text-white focus:bg-gray-700 focus:border-sky-400"
                                  : "bg-white border-gray-300 text-slate-900 focus:bg-gray-50 focus:border-sky-500"
                              } focus:outline-none focus:ring-2 focus:ring-sky-500/20`}
                              disabled={updateLoading}
                            >
                              {validStatuses.map((status) => (
                                <option key={status} value={status} className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-slate-900"}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className={`p-4 rounded-full mb-4 ${
                            isDarkMode ? "bg-slate-800/50" : "bg-slate-100/50"
                          }`}>
                            <FaShoppingCart className={`h-12 w-12 ${
                              isDarkMode ? "text-slate-600" : "text-slate-400"
                            }`} />
                          </div>
                          <p className={`text-lg font-medium ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            No orders found
                          </p>
                          <p className={`text-sm ${
                            isDarkMode ? "text-slate-500" : "text-slate-500"
                          }`}>
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderDetails && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-4xl w-full rounded-2xl backdrop-blur-md border shadow-2xl ${
                  isDarkMode 
                    ? "bg-slate-900/90 border-white/10 shadow-purple-500/20" 
                    : "bg-white/90 border-white/50 shadow-sky-500/20"
                }`}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                        isDarkMode 
                          ? "from-sky-400 to-purple-400" 
                          : "from-sky-600 to-purple-600"
                      }`}>
                        Order Details
                      </h2>
                      <p className={`mt-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}>
                        Order #{selectedOrder.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { icon: FaPrint, onClick: handlePrint, title: "Print order" },
                        { icon: FaDownload, onClick: handleDownload, title: "Download invoice" },
                        { icon: FaShare, onClick: handleShare, title: "Share order" },
                        { icon: FaTimesCircle, onClick: handleCloseDetails, title: "Close" }
                      ].map(({ icon: Icon, onClick, title }, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={onClick}
                          className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                            isDarkMode
                              ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                              : "bg-white/50 border-white/30 text-slate-600 hover:bg-white/70 hover:text-slate-900"
                          }`}
                          title={title}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className={`p-6 rounded-xl backdrop-blur-md border ${
                      isDarkMode 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/50 border-white/30"
                    }`}>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-slate-200" : "text-slate-800"
                      }`}>
                        Order Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sky-500/20">
                            <FaCalendarAlt className="text-sky-500 w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}>Order Date</p>
                            <p className={`font-medium ${
                              isDarkMode ? "text-slate-200" : "text-slate-800"
                            }`}>
                              {selectedOrder.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <FaUser className="text-purple-500 w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}>User ID</p>
                            <p className={`font-medium ${
                              isDarkMode ? "text-slate-200" : "text-slate-800"
                            }`}>
                              {selectedOrder.userId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <FaDollarSign className="text-green-500 w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-sm ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}>Total Amount</p>
                            <p className={`font-bold text-lg ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                            }`}>
                              ${selectedOrder.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`p-6 rounded-xl backdrop-blur-md border ${
                      isDarkMode 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/50 border-white/30"
                    }`}>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        isDarkMode ? "text-slate-200" : "text-slate-800"
                      }`}>
                        Shipping Address
                      </h3>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20 mt-1">
                          <FaMapMarkerAlt className="text-red-500 w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className={`font-medium ${
                            isDarkMode ? "text-slate-200" : "text-slate-800"
                          }`}>
                            {selectedOrder.address?.street || "No street address"}
                          </p>
                          <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                            {selectedOrder.address?.city || "No city"}, {selectedOrder.address?.state || "No state"} {selectedOrder.address?.zipCode || ""}
                          </p>
                          <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                            {selectedOrder.address?.country || "No country"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className={`text-xl font-semibold mb-6 ${
                      isDarkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, index) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-md border ${
                              isDarkMode 
                                ? "bg-white/5 border-white/10" 
                                : "bg-white/50 border-white/30"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {product?.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                                />
                              ) : (
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center backdrop-blur-md border ${
                                  isDarkMode 
                                    ? "bg-white/5 border-white/10" 
                                    : "bg-white/50 border-white/30"
                                }`}>
                                  <FaBox className={`w-6 h-6 ${
                                    isDarkMode ? "text-slate-500" : "text-slate-400"
                                  }`} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-lg ${
                                isDarkMode ? "text-slate-200" : "text-slate-800"
                              }`}>
                                {product?.productName || "Product not found"}
                              </h4>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm backdrop-blur-md ${
                                  isDarkMode 
                                    ? "bg-sky-500/20 text-sky-400" 
                                    : "bg-sky-500/10 text-sky-600"
                                }`}>
                                  Qty: {item.quantity}
                                </span>
                                <span className={`text-sm ${
                                  isDarkMode ? "text-slate-400" : "text-slate-600"
                                }`}>
                                  ${item.price?.toFixed(2) || "0.00"} each
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-xl ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`mt-8 p-6 rounded-xl backdrop-blur-md border ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10" 
                      : "bg-white/50 border-white/30"
                  }`}>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
                      Order Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                          Subtotal
                        </span>
                        <span className={`font-medium ${
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        }`}>
                          ${selectedOrder.subtotalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                          Shipping
                        </span>
                        <span className={`font-medium ${
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        }`}>
                          ${selectedOrder.shippingCost?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                          Tax
                        </span>
                        <span className={`font-medium ${
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        }`}>
                          ${selectedOrder.taxAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className={`pt-4 mt-4 border-t flex justify-between items-center ${
                        isDarkMode ? "border-white/10" : "border-white/30"
                      }`}>
                        <span className={`text-xl font-bold ${
                          isDarkMode ? "text-slate-200" : "text-slate-800"
                        }`}>
                          Total
                        </span>
                        <span className={`text-2xl font-bold ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}>
                          ${selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrderManager;
