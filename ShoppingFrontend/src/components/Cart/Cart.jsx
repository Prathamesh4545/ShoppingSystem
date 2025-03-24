import React, { useCallback, useMemo, useContext } from "react";
import { useCart } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { ThemeContext } from "../../context/ThemeContext";

const Cart = () => {
  const { isDark } = useContext(ThemeContext);
  const { cart, removeFromCart, updateQuantity, fetchCart, loading, error } =
    useCart();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Safe total price calculation
  const totalPrice = useMemo(() => {
    if (!Array.isArray(cart)) return 0; // Ensure cart is an array
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  }, [cart]);

  const handleIncrement = useCallback(
    async (itemId) => {
      try {
        await updateQuantity(itemId, 1);
        await fetchCart(); // Refresh cart data after update
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
        await fetchCart(); // Refresh cart data after update
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
      navigate("/");
      return;
    }
    if (cart.length > 0) {
      navigate("/checkout");
    }
  }, [isAuthenticated, navigate, cart]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg font-semibold">
          Error loading cart: {error.message || "Something went wrong."}
        </div>
        <button
          onClick={fetchCart}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty cart state
  if (!Array.isArray(cart)) return null; // Ensure cart is an array before proceeding
  if (cart.length === 0) {
    return (
      <div className="pt-20 text-center text-gray-900 dark:text-white">
        <p className="text-xl">Your cart is empty.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Main cart UI
  return (
    <div className={`pt-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
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
          <OrderSummary
            totalPrice={totalPrice}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Cart);