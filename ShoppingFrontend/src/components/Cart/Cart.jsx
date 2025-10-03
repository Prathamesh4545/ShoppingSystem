import React, { useCallback, useMemo, useContext, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNotificationHandler } from "../../hooks/useNotificationHandler";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import ThemeContext from "../../context/ThemeContext";
import { FaShoppingCart, FaArrowLeft, FaTag, FaGift, FaPercent } from "react-icons/fa";
import { motion } from "framer-motion";

const Cart = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { cart, removeFromCart, updateQuantity, fetchCart, loading, error } = useCart();
  const { isAuthenticated, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { notifyItemRemovedFromCart, notifyCartCleared, notifyOrderPlaced, notifyNetworkError } = useNotificationHandler();



  // Calculate total price with deals
  const totalPrice = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      const product = item.product || {};
      const price = product.price || 0;
      const quantity = item.quantity || 0;
      const dealInfo = product.dealInfo;

      // Check if deal is still valid
      const isDealValid = dealInfo && (() => {
        const dealIsActive = dealInfo.active !== undefined ? dealInfo.active : dealInfo.isActive;
        if (!dealIsActive) return false;
        const endDateTime = new Date(`${dealInfo.endDate}T${dealInfo.endTime || '23:59:59'}`);
        return endDateTime > new Date();
      })();

      // Apply discount if deal exists and is valid
      const discountedPrice = isDealValid
        ? price * (1 - dealInfo.discountPercentage / 100)
        : price;

      return total + (discountedPrice * quantity);
    }, 0);
  }, [cart]);

  // Calculate total savings from valid deals
  const totalSavings = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      const product = item.product || {};
      const price = product.price || 0;
      const quantity = item.quantity || 0;
      const dealInfo = product.dealInfo;

      // Only count savings from valid deals
      const isDealValid = dealInfo && (() => {
        const dealIsActive = dealInfo.active !== undefined ? dealInfo.active : dealInfo.isActive;
        if (!dealIsActive) return false;
        const endDateTime = new Date(`${dealInfo.endDate}T${dealInfo.endTime || '23:59:59'}`);
        return endDateTime > new Date();
      })();
      
      if (isDealValid) {
        const discount = price * (dealInfo.discountPercentage / 100);
        return total + (discount * quantity);
      }
      return total;
    }, 0);
  }, [cart]);

  // Get active deals summary
  const dealsSummary = useMemo(() => {
    if (!Array.isArray(cart)) return { count: 0, deals: [] };
    
    const dealsMap = new Map();
    cart.forEach(item => {
      const dealInfo = item.product?.dealInfo;
      const isDealValid = dealInfo && (() => {
        const dealIsActive = dealInfo.active !== undefined ? dealInfo.active : dealInfo.isActive;
        if (!dealIsActive) return false;
        const endDateTime = new Date(`${dealInfo.endDate}T${dealInfo.endTime || '23:59:59'}`);
        return endDateTime > new Date();
      })();
      
      if (isDealValid) {
        if (!dealsMap.has(dealInfo.id)) {
          dealsMap.set(dealInfo.id, {
            ...dealInfo,
            itemCount: 1,
            totalSavings: (item.product.price * item.quantity * dealInfo.discountPercentage / 100)
          });
        } else {
          const deal = dealsMap.get(dealInfo.id);
          deal.itemCount += 1;
          deal.totalSavings += (item.product.price * item.quantity * dealInfo.discountPercentage / 100);
        }
      }
    });

    return {
      count: dealsMap.size,
      deals: Array.from(dealsMap.values())
    };
  }, [cart]);

  const handleIncrement = useCallback(
    async (itemId) => {
      try {
        await updateQuantity(itemId, 1);
        await fetchCart();
      } catch (error) {
        console.error("Increment error - sanitized");
        notifyNetworkError();
      }
    },
    [updateQuantity, fetchCart]
  );

  const handleDecrement = useCallback(
    async (itemId) => {
      try {
        const itemInCart = cart.find((item) => item.id === itemId);
        if (!itemInCart) {
          console.warn(`Item with ID ${itemId} not found in cart.`);
          return;
        }

        if (itemInCart.quantity > 1) {
          await updateQuantity(itemId, -1);
        } else {
          await removeFromCart(itemId);
          const item = cart.find(item => item.id === itemId);
          if (item?.product?.productName) {
            notifyItemRemovedFromCart(item.product.productName);
          }
        }
        await fetchCart();
      } catch (error) {
        console.error("Decrement error - sanitized");
        notifyNetworkError();
      }
    },
    [cart, removeFromCart, updateQuantity, fetchCart]
  );

  // Handle checkout process
  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to proceed to checkout.");
      navigate("/login");
      return;
    }
    if (cart.length > 0) {
      navigate("/checkout");
    }
  }, [isAuthenticated, navigate, cart]);

  const handlePlaceOrder = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    try {
      // Here you would typically make an API call to place the order
      // For now, we'll just show a success message
      const orderId = `ORD${Date.now()}`;
      notifyOrderPlaced(orderId);
      // Clear the cart after successful order
      await fetchCart();
      navigate("/orders");
    } catch (error) {
      notifyNetworkError();
    }
  }, [isAuthenticated, navigate, fetchCart]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-lg font-semibold text-center mb-4">
          Error loading cart: {error.message || "Something went wrong."}
        </div>
        <button
          onClick={fetchCart}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty cart state
  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className={`pt-16 min-h-screen flex flex-col items-center justify-center p-4 ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}>
        <div className="text-center max-w-md mx-auto">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <FaShoppingCart className={`w-24 h-24 ${
              isDarkMode ? "text-gray-600" : "text-gray-300"
            }`} />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
              0
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <FaArrowLeft className="text-sm" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Main cart UI
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
      
      <div className="relative z-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent flex items-center gap-3 ${
              isDarkMode 
                ? "from-sky-400 via-purple-400 to-sky-400" 
                : "from-sky-600 via-purple-600 to-sky-600"
            }`}>
              Shopping Cart
              <span className={`text-lg px-3 py-1 rounded-full backdrop-blur-md border ${
                isDarkMode 
                  ? "bg-sky-500/20 border-sky-500/30 text-sky-400" 
                  : "bg-sky-500/10 border-sky-500/20 text-sky-600"
              }`}>
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  : "bg-white/50 border-white/30 text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              <FaArrowLeft className="text-sm" />
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Active Deals Banner */}
        {dealsSummary.count > 0 && (
          <div className="mb-8">
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 dark:bg-green-500/30 rounded-full">
                    <FaGift className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-600 dark:text-green-300">
                      Active Deals ({dealsSummary.count})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white">
                      You have {dealsSummary.deals.length} special {dealsSummary.deals.length === 1 ? 'offer' : 'offers'}
                    </p>
                  </div>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                    <FaPercent className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-600 dark:text-green-300">
                      Total Savings: ₹{totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Deal Details */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dealsSummary.deals.map(deal => (
                  <div key={deal.id} className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTag className="text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {deal.title || "Special Offer"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-white">
                        {deal.itemCount} {deal.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-green-600 dark:text-green-300 font-medium">
                        Save ₹{deal.totalSavings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                handleIncrement={handleIncrement}
                handleDecrement={handleDecrement}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <OrderSummary
              totalPrice={totalPrice}
              totalSavings={totalSavings}
              handleCheckout={() => navigate("/checkout")}
              handlePlaceOrder={() => {}}
              cart={cart}
              showCheckoutButton={true}
              loading={loading}
            />
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(Cart);