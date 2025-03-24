import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const CartItem = React.memo(
  ({ item, handleIncrement, handleDecrement, removeFromCart }) => {
    const product = item.product || {};
    const price = product.price || 0;
    const quantity = item.quantity || 0;

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

    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg shadow-sm ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Product Image */}
        <div className="shrink-0">
          <img
            className="h-20 w-20 rounded-lg object-cover"
            src={
              product.images?.[0]?.imageData
                ? `data:image/jpeg;base64,${product.images[0].imageData}`
                : "/images/placeholder.webp"
            }
            alt={product.productName || "Product image"}
            onError={(e) => (e.target.src = "/images/placeholder.webp")}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-2">
          <Link
            to={`/product/${product.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            {product.productName || "Unnamed Product"}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ${price.toFixed(2)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
            onClick={() => handleDecrement(item.id)}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
            onClick={() => handleIncrement(item.id)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          className="p-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors duration-300"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          Remove
        </button>
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
    }),
    quantity: PropTypes.number,
  }).isRequired,
  handleIncrement: PropTypes.func.isRequired,
  handleDecrement: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

export default CartItem;
