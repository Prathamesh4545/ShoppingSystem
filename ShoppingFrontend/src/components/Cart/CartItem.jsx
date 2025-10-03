import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";
import { FaTag, FaClock, FaPercent, FaExclamationCircle, FaTrash } from "react-icons/fa";

const CartItem = React.memo(
  ({ item, handleIncrement, handleDecrement, removeFromCart }) => {
    const { isDarkMode } = useContext(ThemeContext);
    const product = item.product || {};
    const price = product.price || 0;
    const quantity = item.quantity || 0;
    const dealInfo = product.dealInfo;

    const handleRemove = async () => {
      const confirmRemove = window.confirm(
        "Are you sure you want to remove this item from the cart?"
      );
      if (!confirmRemove) return;

      try {
        await removeFromCart(item.id);
        toast.success("Item removed from cart successfully.");
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
        toast.error(
          error.message || "Failed to remove item from cart. Please try again."
        );
      }
    };

    // Check if deal is still valid
    const isDealValid = useMemo(() => {
      if (!dealInfo?.endDate) return false;
      return new Date(dealInfo.endDate) > new Date();
    }, [dealInfo]);

    const displayPrice = isDealValid ? price * (1 - dealInfo.discountPercentage / 100) : price;
    const itemTotal = displayPrice * quantity;
    const originalTotal = price * quantity;
    const savings = originalTotal - itemTotal;

    // Calculate time remaining for the deal
    const getTimeRemaining = () => {
      if (!dealInfo?.endDate || !isDealValid) return null;
      const endDate = new Date(dealInfo.endDate);
      const now = new Date();
      const diff = endDate - now;
      
      if (diff <= 0) return null;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    return (
      <div className={`relative flex flex-col sm:flex-row items-start gap-6 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg ${
        isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:bg-gray-50"
      }`}>
        {/* Deal Badge */}
        {isDealValid && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <FaPercent className="text-xs" />
              {dealInfo.discountPercentage}% OFF
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative group w-full sm:w-32 h-32 rounded-lg overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            src={
              product.images?.[0]?.imageData && product.images[0]?.imageType
                ? `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
                : "/images/placeholder.webp"
            }
            alt={product.productName || "Product image"}
            onError={(e) => (e.target.src = "/images/placeholder.webp")}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/product/${product.id}`}
            className="block text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 truncate transition-colors duration-200"
          >
            {product.productName || "Unnamed Product"}
          </Link>

          {/* Price Display */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${displayPrice.toFixed(2)}
            </span>
            {isDealValid && (
              <span className="text-sm text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Deal Information */}
          {isDealValid && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <FaTag className="text-xs" />
                <span>{dealInfo.title || "Special Offer"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
                <FaClock className="text-xs" />
                <span>Ends in {getTimeRemaining()}</span>
              </div>
              {dealInfo.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {dealInfo.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quantity and Total Section */}
        <div className="flex flex-col items-end gap-4 min-w-[180px]">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
              onClick={() => handleDecrement(item.id)}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-10 text-center font-medium text-gray-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
              onClick={() => handleIncrement(item.id)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Price Summary */}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${itemTotal.toFixed(2)}
            </div>
            {isDealValid && (
              <>
                <div className="text-sm text-gray-500 line-through">
                  ${originalTotal.toFixed(2)}
                </div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  You save: ${savings.toFixed(2)}
                </div>
              </>
            )}
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
          >
            <FaTrash className="text-xs" />
            Remove
          </button>
        </div>
      </div>
    );
  }
);

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    product: PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string,
      price: PropTypes.number,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          imageData: PropTypes.string,
        })
      ),
      dealInfo: PropTypes.shape({
        discountPercentage: PropTypes.number,
        endDate: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
      }),
    }),
    quantity: PropTypes.number,
  }).isRequired,
  handleIncrement: PropTypes.func.isRequired,
  handleDecrement: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

export default CartItem;
