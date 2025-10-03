import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  FaShoppingBag,
  FaTag,
  FaClock,
  FaPercent,
  FaTruck,
  FaGift,
  FaShieldAlt,
} from "react-icons/fa";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";

const OrderSummary = ({
  totalPrice,
  totalSavings,
  handleCheckout,
  handlePlaceOrder,
  cart,
  showCheckoutButton = true,
  loading,
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  // Calculate subtotal (original price before discounts)
  const subtotal = totalPrice + totalSavings;

  // Calculate shipping based on subtotal (Free shipping over ₹1000)
  const shipping = useMemo(() => {
    if (subtotal >= 1000) return 0;
    return 100;
  }, [subtotal]);

  // Calculate final total
  const finalTotal = useMemo(() => {
    return totalPrice + shipping;
  }, [totalPrice, shipping]);

  // Get active deals from cart
  const activeDeals = useMemo(() => {
    if (!Array.isArray(cart)) return [];
    const deals = new Map();

    cart.forEach((item) => {
      const dealInfo = item.product?.dealInfo;
      if (dealInfo && new Date(dealInfo.endDate) > new Date()) {
        if (!deals.has(dealInfo.id)) {
          deals.set(dealInfo.id, {
            ...dealInfo,
            itemCount: 1,
            totalSavings:
              (item.product.price *
                item.quantity *
                dealInfo.discountPercentage) /
              100,
          });
        } else {
          const deal = deals.get(dealInfo.id);
          deal.itemCount += 1;
          deal.totalSavings +=
            (item.product.price * item.quantity * dealInfo.discountPercentage) /
            100;
        }
      }
    });

    return Array.from(deals.values());
  }, [cart]);

  // Calculate time remaining for a deal
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate shipping progress
  const shippingProgress = useMemo(() => {
    const progress = (subtotal / 1000) * 100;
    return Math.min(100, progress);
  }, [subtotal]);

  return (
    <div
      className={`rounded-xl p-6 shadow-lg ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <FaShoppingBag className="text-blue-500" />
        Order Summary
      </h3>

      <div className="space-y-6">
        {/* Active Deals Summary */}
        {activeDeals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaGift className="text-green-500" />
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                Active Deals ({activeDeals.length})
              </h4>
            </div>
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaPercent className="text-xs" />
                    {deal.discountPercentage}% OFF
                  </div>
                  <div className="text-orange-600 dark:text-orange-400 text-xs flex items-center gap-1">
                    <FaClock />
                    {getTimeRemaining(deal.endDate)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <FaTag className="text-xs" />
                  <span className="font-medium">
                    {deal.title || "Special Offer"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {deal.itemCount} {deal.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Save ₹{deal.totalSavings.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          {totalSavings > 0 && (
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <FaTag className="text-xs" />
                Deal Savings
              </span>
              <span className="font-medium">-₹{totalSavings.toFixed(2)}</span>
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
                `₹${shipping.toFixed(2)}`
              )}
            </span>
          </div>


        </div>

        {/* Shipping Progress Bar */}
        {subtotal < 1000 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 dark:text-blue-400">
                Add ₹{(1000 - subtotal).toFixed(2)} for FREE shipping
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {shippingProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{finalTotal.toFixed(2)}
              </span>
              {totalSavings > 0 && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  You save ₹{totalSavings.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Prices and shipping calculated at checkout
          </p>
        </div>

        {/* Button Section */}
        {showCheckoutButton ? (
          // Cart View - Show "Proceed to Checkout" button
          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium"
          >
            <FaShoppingBag />
            Proceed to Checkout
          </button>
        ) : (
          // Checkout View - Show "Place Order" button
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FaShoppingBag />
            )}
            {loading ? "Processing..." : "Place Order"}
          </button>
        )}
      </div>
    </div>
  );
};

OrderSummary.propTypes = {
  totalPrice: PropTypes.number.isRequired,
  totalSavings: PropTypes.number.isRequired,
  handleCheckout: PropTypes.func.isRequired,
  handlePlaceOrder: PropTypes.func.isRequired,
  showCheckoutButton: PropTypes.bool,
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.shape({
        dealInfo: PropTypes.shape({
          id: PropTypes.number,
          title: PropTypes.string,
          discountPercentage: PropTypes.number,
          endDate: PropTypes.string,
        }),
      }),
    })
  ),
  loading: PropTypes.bool,
};

export default React.memo(OrderSummary);
