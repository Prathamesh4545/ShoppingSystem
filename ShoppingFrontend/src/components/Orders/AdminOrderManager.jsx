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

    setUpdateLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      toast.success("Status updated successfully");
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
      className={`p-8 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
            <FaShoppingCart className="mr-2" />
            Admin Order Management
          </h1>
          <div className="flex items-center gap-4">
          <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center"
          >
            <FaExclamationTriangle className="mr-2" />
            {error}
          </motion.div>
        )}

        {/* Filters and Search */}
        <div
          className={`rounded-xl p-6 shadow-lg mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
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
              {validStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
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
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 text-left">Order ID</th>
                <th className="py-4 px-6 text-left">User ID</th>
                <th className="py-4 px-6 text-left">Date</th>
                <th className="py-4 px-6 text-left">Total</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition ease-in-out duration-300"
                  >
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-200">
                      {order.id}
                    </td>
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-400">
                      {order.userId}
                    </td>
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-400">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-semibold dark:text-gray-200">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transform hover:scale-105 transition-transform"
                        title="View details"
                      >
                        <FaSearch className="w-5 h-5" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className="text-sm rounded-md shadow-md border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        disabled={updateLoading}
                      >
                        {validStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center">
                      <FaShoppingCart className="h-14 w-14 text-gray-300 dark:text-gray-700 mb-4" />
                      <p>No orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                className={`max-w-4xl w-full rounded-xl shadow-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Print order"
                      >
                        <FaPrint className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Download invoice"
                      >
                        <FaDownload className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Share order"
                      >
                        <FaShare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCloseDetails}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <FaTimesCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Order Information
                      </h3>
                      <div className="space-y-2">
                        <p className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          Order Date:{" "}
                          {selectedOrder.createdAt.toLocaleDateString()}
                        </p>
                        <p className="flex items-center">
                          <FaUser className="mr-2 text-green-500" />
                          User ID: {selectedOrder.userId}
                        </p>
                        <p className="flex items-center">
                          <FaDollarSign className="mr-2 text-yellow-500" />
                          Total Amount: ${selectedOrder.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Shipping Address
                      </h3>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="mr-2 text-red-500 mt-1" />
                        <div>
                          <p>{selectedOrder.address?.street}</p>
                          <p>
                            {selectedOrder.address?.city},{" "}
                            {selectedOrder.address?.state}{" "}
                            {selectedOrder.address?.zipCode}
                          </p>
                          <p>{selectedOrder.address?.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              {product?.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="w-16 h-16 rounded object-cover"
                                />
                              ) : (
                                <div
                                  className={`w-16 h-16 rounded flex items-center justify-center ${
                                    isDarkMode ? "bg-gray-600" : "bg-gray-200"
                                  }`}
                                >
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-medium ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {product?.productName || "Product not found"}
                              </h4>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Quantity: {item.quantity}
                              </p>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Price: ${item.price?.toFixed(2) || "0.00"} each
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-medium ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                    <div className="flex justify-between py-1">
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Subtotal
                      </span>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        ${selectedOrder.subtotalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Shipping
                      </span>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        ${selectedOrder.shippingCost?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Tax
                      </span>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        ${selectedOrder.taxAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Total
                      </span>
                      <span
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ${selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminOrderManager;
