import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import ThemeContext from "../../context/ThemeContext";
import { API_URL } from "../../config/constants";
import {
  FaShoppingBag,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTag,
  FaRupeeSign,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort,
  FaSpinner,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatDate } from "../../utils/dateUtils";

const OrdersList = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to view your orders");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        // Filter out any orders that might be marked as deleted
        const activeOrders = ordersData.filter(order => order.status !== 'DELETED');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to view these orders.");
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      toast.success("Order cancelled successfully!");
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setOrders(orders.filter(order => order.id !== orderId));
      toast.success("Order deleted successfully!");
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Delete error:", error);
      
      if (error.response?.status === 404) {
        setOrders(orders.filter(order => order.id !== orderId));
        toast.warning("Order not found or already deleted.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this order.");
      } else {
        toast.error("Failed to delete order. Please try again.");
      }
      
      setShowDeleteModal(false);
      setSelectedOrder(null);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500";
      case "PROCESSING":
        return "text-blue-500";
      case "SHIPPED":
        return "text-purple-500";
      case "DELIVERED":
        return "text-green-500";
      case "CANCELLED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <FaClock className="w-5 h-5" />;
      case "PROCESSING":
        return <FaBox className="w-5 h-5" />;
      case "SHIPPED":
        return <FaTruck className="w-5 h-5" />;
      case "DELIVERED":
        return <FaCheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <FaTimesCircle className="w-5 h-5" />;
      default:
        return <FaShoppingBag className="w-5 h-5" />;
    }
  };

  const calculateTotalSavings = (items) => {
    return items.reduce((total, item) => {
      if (item.dealInfo && new Date(item.dealInfo.endDate) > new Date()) {
        const originalPrice = item.price * item.quantity;
        const discountedPrice = originalPrice * (1 - item.dealInfo.discountPercentage / 100);
        return total + (originalPrice - discountedPrice);
      }
      return total;
    }, 0);
  };

  const calculateOrderTotal = (order) => {
    const originalSubtotal = order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const totalSavings = calculateTotalSavings(order.items);
    const subtotal = originalSubtotal - totalSavings;
    const shipping = subtotal >= 1000 ? 0 : 100;
    const tax = subtotal * 0.1;
    return subtotal + shipping + tax;
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.id.toString().includes(searchTerm) ||
        order.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return calculateOrderTotal(b) - calculateOrderTotal(a);
        case "lowest":
          return calculateOrderTotal(a) - calculateOrderTotal(b);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`pt-16 min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{marginTop: '50px'}}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"}`}>
              <FaShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Track and manage your orders</p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaShoppingBag className="mr-2" />
            Continue Shopping
          </Link>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-6 shadow-lg mb-8 backdrop-blur-sm ${isDarkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-gray-200"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </motion.div>

        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-12 shadow-lg text-center backdrop-blur-sm border ${isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"}`}
            >
              <FaShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                No orders found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "ALL"
                  ? "Try adjusting your search or filters"
                  : "Start shopping to create your first order"}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaShoppingBag className="mr-2" />
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`block rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm border ${
                    isDarkMode ? "bg-gray-800/80 hover:bg-gray-700/80 border-gray-700" : "bg-white/80 hover:bg-gray-50/80 border-gray-200"
                  } hover:scale-[1.02] hover:-translate-y-1`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <Link to={`/orders/${order.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order #{order.id}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} bg-opacity-10`}>
                        {order.status}
                      </span>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors duration-200"
                          title="Cancel order"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        title="Delete order"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/orders/${order.id}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          Delivery Address
                        </h3>
                        <p className="text-gray-900 dark:text-white">
                          {order.address.street}, {order.address.city}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {order.address.state} {order.address.zipCode}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Order Total
                        </h3>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          <FaRupeeSign className="inline-block text-sm" />
                          {calculateOrderTotal(order).toFixed(2)}
                        </p>
                        {calculateTotalSavings(order.items) > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 md:justify-end">
                            <FaTag className="text-xs" />
                            Saved <FaRupeeSign className="inline-block text-xs" />
                            {calculateTotalSavings(order.items).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 dark:text-gray-100">
                Confirm Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete order #{selectedOrder.id}? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Only orders that haven't been processed can be deleted.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersList; 