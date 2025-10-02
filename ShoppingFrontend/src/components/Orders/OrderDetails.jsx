import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import ThemeContext from "../../context/ThemeContext";
import { DataContext } from "../../context/ProductContext";
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
  FaArrowLeft,
  FaTag,
  FaGift,
  FaPercent,
  FaRupeeSign,
  FaShieldAlt,
  FaDownload,
  FaPrint,
  FaShare,
  FaSearch,
} from "react-icons/fa";
import { motion } from "framer-motion";

const OrderDetails = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user, token } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { products, getAllProducts } = useContext(DataContext);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        // Fetch order details
        const response = await fetch(`${API_URL}/orders/${orderId}/user/${user.id}`, {
          headers: {
            Authorization: formattedToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          if (response.status === 403) {
            toast.error(errorData || "You don't have permission to view this order");
            navigate("/my-orders");
            return;
          }
          if (response.status === 401) {
            toast.error(errorData || "Please login to view order details");
            navigate("/login");
            return;
          }
          if (response.status === 404) {
            toast.error("Order not found or has been deleted");
            navigate("/my-orders");
            return;
          }
          throw new Error(errorData || "Failed to fetch order details");
        }

        const data = await response.json();
        if (!data) {
          throw new Error("No order data received");
        }

        // Ensure we have all products loaded
        await getAllProducts();

        // Process the order items to include full product details
        const processedItems = data.items.map(item => {
          const fullProduct = products.find(p => p.id === item.productId);
          return {
            ...item,
            product: fullProduct || {
              id: item.productId,
              productName: item.productName || "Unknown Product",
              price: item.price,
              images: item.productImages || [],
              dealInfo: item.dealInfo
            }
          };
        });

        setOrder({
          ...data,
          items: processedItems
        });

      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error(error.message || "Failed to load order details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token && user?.id) {
      fetchOrderDetails();
    } else {
      setLoading(false);
      toast.error("Missing required information to fetch order details");
      navigate("/");
    }
  }, [orderId, token, user?.id, navigate, products, getAllProducts]);

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
      const product = item.product;
      if (product?.dealInfo && new Date(product.dealInfo.endDate) > new Date()) {
        const originalPrice = product.price * item.quantity;
        const discountedPrice = originalPrice * (1 - product.dealInfo.discountPercentage / 100);
        return total + (originalPrice - discountedPrice);
      }
      return total;
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${order.id}`,
          text: `Check out my order #${order.id} from the shopping system`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast.info("Sharing is not supported on this browser");
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setOrder(prev => ({ ...prev, status: "CANCELLED" }));
        toast.success("Order cancelled successfully!");
      } else {
        toast.error("Failed to cancel order. Please try again.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Order not found
          </h2>
          <button
            onClick={() => navigate("/my-orders")}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate original subtotal (before discounts)
  const originalSubtotal = order.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const totalSavings = calculateTotalSavings(order.items);
  const subtotal = originalSubtotal - totalSavings; // Subtotal after discounts
  const shipping = subtotal >= 1000 ? 0 : 100; // Free shipping over ₹1000
  const tax = subtotal * 0.1; // 10% tax on discounted price
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className={`pt-16 min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{marginTop: '50px'}}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-orders")}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Print order"
            >
              <FaPrint className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Share order"
            >
              <FaShare className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Download invoice"
            >
              <FaDownload className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-6 shadow-lg backdrop-blur-lg mb-8 ${
            isDarkMode ? "bg-white/10 border border-white/20" : "bg-white/70 border border-white/30"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order #{order.id}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} bg-opacity-10 ${isDarkMode ? 'bg-white' : 'bg-gray-100'}`}>
                {order.status}
              </span>
              {order.status === "PENDING" && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Order Date
              </h3>
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Payment Status
              </h3>
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FaShieldAlt className="text-green-500" />
                {order.paymentStatus}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Delivery Method
              </h3>
              <p className="text-gray-900 dark:text-white flex items-center gap-2">
                <FaTruck className="text-purple-500" />
                Standard Delivery
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-6 shadow-lg backdrop-blur-lg mb-8 ${
            isDarkMode ? "bg-white/10 border border-white/20" : "bg-white/70 border border-white/30"
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Order Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => {
              const product = item.product;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <img
                    src={product?.images?.[0]?.imageData ? 
                      `data:image/jpeg;base64,${product.images[0].imageData}` : 
                      "/images/placeholder.webp"
                    }
                    alt={product?.productName || "Product"}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.webp";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {product?.productName || "Unknown Product"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">
                        <FaRupeeSign className="inline-block" />
                        {item.price.toFixed(2)}
                      </span>
                      {product?.dealInfo && new Date(product.dealInfo.endDate) > new Date() && (
                        <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                          <FaTag className="text-xs" />
                          {product.dealInfo.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-6 shadow-lg backdrop-blur-lg mb-8 ${
            isDarkMode ? "bg-white/10 border border-white/20" : "bg-white/70 border border-white/30"
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Price Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium">
                <FaRupeeSign className="inline-block" />
                {subtotal.toFixed(2)}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1">
                  <FaTag className="text-xs" />
                  Deal Savings
                </span>
                <span className="font-medium">
                  -<FaRupeeSign className="inline-block" />
                  {totalSavings.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaTruck className="text-xs" />
                Shipping
              </span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400">FREE</span>
                ) : (
                  <>
                    <FaRupeeSign className="inline-block" />
                    {shipping.toFixed(2)}
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaShieldAlt className="text-xs" />
                Tax (10%)
              </span>
              <span className="font-medium">
                <FaRupeeSign className="inline-block" />
                {tax.toFixed(2)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  <FaRupeeSign className="inline-block" />
                  {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl p-6 shadow-lg backdrop-blur-lg ${
            isDarkMode ? "bg-white/10 border border-white/20" : "bg-white/70 border border-white/30"
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Delivery Address
          </h3>
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white">
              {order.address.street}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.address.country}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails; 