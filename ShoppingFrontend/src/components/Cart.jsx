import React, { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Memoized Cart Item Component with Discount Display
const CartItem = React.memo(({ item, handleIncrement, handleDecrement, removeFromCart, discountedPrice }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      {/* Product Image */}
      <div className="shrink-0">
        <img
          className="h-20 w-20 rounded-lg object-cover"
          src={item.imageData ? `data:image/jpeg;base64,${item.imageData}` : "/images/placeholder.webp"}
          alt={item.productName}
          onError={(e) => (e.target.src = "/images/placeholder.webp")}
        />
      </div>

      {/* Product Details with Discount */}
      <div className="flex-1 space-y-2">
        <Link
          to={`/product/${item.id}`}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          {item.productName}
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ${discountedPrice.toFixed(2)}
          {discountedPrice < item.price && (
            <span className="text-xs text-gray-400 line-through ml-2">${item.price.toFixed(2)}</span>
          )}
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
          <svg className="w-4 h-4 text-gray-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
        <span className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
        <button
          type="button"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
          onClick={() => handleIncrement(item.id)}
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4 text-gray-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="p-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors duration-300"
        onClick={() => removeFromCart(item.id)}
        aria-label="Remove item"
      >
        Remove
      </button>
    </div>
  );
});

// Order Summary Component
const OrderSummary = React.memo(({ totalPrice, handleCheckout }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order Summary</h3>

      <div className="mt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
        </div>
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
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

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const { isAuthenticated, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeDeals, setActiveDeals] = useState([]);

  // Fetch active deals
  useEffect(() => {
    if (token) {
      fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch active deals");
          return res.json();
        })
        .then(setActiveDeals)
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch active deals");
        });
    }
  }, [token]);

  // Calculate discounted price for each item
  const applyDiscount = useCallback(
    (product) => {
      const deal = activeDeals.find((deal) =>
        deal.products?.some((p) => p.id === product.id)
      );
      return deal
        ? product.price * (1 - deal.discountPercentage / 100)
        : product.price;
    },
    [activeDeals]
  );

  // Updated total price calculation with discounts
  const totalPrice = useMemo(() => {
    return cart.reduce(
      (total, item) => total + applyDiscount(item) * item.quantity,
      0
    );
  }, [cart, applyDiscount]);

  // Handle increment and decrement
  const handleIncrement = useCallback(
    (itemId) => {
      const item = cart.find((product) => product.id === itemId);
      if (item.quantity < item.stockQuantity) {
        updateQuantity(itemId, 1);
      } else {
        toast.warning("Maximum stock quantity reached.");
      }
    },
    [cart, updateQuantity]
  );

  const handleDecrement = useCallback(
    (itemId) => {
      const item = cart.find((product) => product.id === itemId);
      if (item.quantity > 1) {
        updateQuantity(itemId, -1);
      }
    },
    [cart, updateQuantity]
  );

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to proceed to checkout.");
      navigate("/login");
      return;
    }
    if (cart.length > 0) {
      navigate("/checkout");
    }
  }, [isAuthenticated, cart, navigate]);

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="pt-20 text-center text-gray-900 dark:text-white">
        <p className="text-xl">Your cart is empty.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
        >
          Continue Shopping
          <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const discountedPrice = applyDiscount(item);
              return (
                <CartItem
                  key={item.id}
                  item={item}
                  discountedPrice={discountedPrice}
                  handleIncrement={handleIncrement}
                  handleDecrement={handleDecrement}
                  removeFromCart={removeFromCart}
                />
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <OrderSummary totalPrice={totalPrice} handleCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Cart);