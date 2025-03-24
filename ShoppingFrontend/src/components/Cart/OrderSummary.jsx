import React from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const OrderSummary = React.memo(({ totalPrice, handleCheckout }) => {
  const { isDark } = useContext(ThemeContext);
  const safeTotalPrice = !isNaN(totalPrice) ? totalPrice.toFixed(2) : "0.00";

  return (
    <div
      className={`rounded-lg p-6 shadow-sm ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Order Summary
      </h3>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${safeTotalPrice}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">
            $0.00
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium text-gray-900 dark:text-white">
            $0.00
          </span>
        </div>
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${safeTotalPrice}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
        aria-label="Proceed to checkout"
      >
        Proceed to Checkout
      </button>
    </div>
  );
});

export default OrderSummary;
