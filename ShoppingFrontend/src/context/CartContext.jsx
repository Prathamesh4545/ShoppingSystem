import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

// Create the CartContext
const CartContext = createContext();

// Helper function for localStorage operations
const cartStorage = {
  get: () => {
    try {
      const cart = localStorage.getItem("cart");
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return [];
    }
  },
  set: (cart) => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
};

// CartProvider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(cartStorage.get());

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    cartStorage.set(cart);
  }, [cart]);

  // Add a product to the cart
  const addToCart = useCallback((product) => {
    if (!product?.id) return;

    setCart((prev) => {
      const existingProduct = prev.find((item) => item.id === product.id);
      if (existingProduct) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // Remove a product from the cart
  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  // Update the quantity of a product in the cart
  const updateQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Clear the entire cart
  const clearCart = useCallback(() => setCart([]), []);

  // Calculate the total price of the cart
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cart,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cart, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export CartContext and useCart hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// Export CartContext as a named export
export { CartContext };