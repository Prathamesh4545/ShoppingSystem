import React, { useCallback, useMemo, useContext, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import ThemeContext from "../../context/ThemeContext";
import { FaShoppingCart, FaArrowLeft, FaTag, FaGift, FaPercent } from "react-icons/fa";

const Cart = () => {
  const { isDark } = useContext(ThemeContext);
  const { cart, removeFromCart, updateQuantity, fetchCart, loading, error } = useCart();
  const { isAuthenticated, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check for expired deals and update cart
  const checkDealExpiration = useCallback(async () => {
    if (!Array.isArray(cart)) return;

    const hasExpiredDeals = cart.some(item => {
      const dealInfo = item.product?.dealInfo;
      if (!dealInfo?.endDate) return false;
      return new Date(dealInfo.endDate) < new Date();
    });

    if (hasExpiredDeals) {
      toast.info("Some deals have expired. Cart prices have been updated.");
      await fetchCart(); // Refresh cart to get updated prices
    }
  }, [cart, fetchCart]);

  // Check for expired deals periodically
  useEffect(() => {
    const interval = setInterval(checkDealExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkDealExpiration]);

  // Calculate total price with deals
  const totalPrice = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      const product = item.product || {};
      const price = product.price || 0;
      const quantity = item.quantity || 0;
      const dealInfo = product.dealInfo;

      // Check if deal is still valid
      const isDealValid = dealInfo && new Date(dealInfo.endDate) > new Date();

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
      if (dealInfo && new Date(dealInfo.endDate) > new Date()) {
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
      if (dealInfo && new Date(dealInfo.endDate) > new Date()) {
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
        console.error("Increment error:", error);
        toast.error(error.message || "Failed to increment quantity.");
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
        }
        await fetchCart();
      } catch (error) {
        console.error("Decrement error:", error);
        toast.error(error.message || "Failed to decrement quantity.");
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
      toast.success("Order placed successfully!");
      // Clear the cart after successful order
      await fetchCart();
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <FaShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-600" />
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
    <div className={`min-h-screen pt-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Shopping Cart
              <span className="text-lg px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <FaArrowLeft className="text-sm" />
            Continue Shopping
          </Link>
        </div>
        
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
                    <h3 className="font-semibold text-green-600 dark:text-green-400">
                      Active Deals ({dealsSummary.count})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You have {dealsSummary.deals.length} special {dealsSummary.deals.length === 1 ? 'offer' : 'offers'}
                    </p>
                  </div>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                    <FaPercent className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Total Savings: ₹{totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Deal Details */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dealsSummary.deals.map(deal => (
                  <div key={deal.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTag className="text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {deal.title || "Special Offer"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {deal.itemCount} {deal.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
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
  );
};

export default React.memo(Cart);