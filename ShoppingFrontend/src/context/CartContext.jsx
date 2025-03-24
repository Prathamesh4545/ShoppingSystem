import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../config/constants";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };
    case "ADD_ITEM":
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      };
    case "CLEAR_CART":
      return { ...state, cart: [], loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: [],
    loading: false,
    error: null,
  });

  const { isAuthenticated, token, hasRole } = useAuth();

  // Fetch the user's cart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to access the cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart.");
      }

      const { items } = await response.json();
      dispatch({ type: "SET_CART", payload: items || [] });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast.error("Failed to load cart.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isAuthenticated, token, hasRole]);

  // Add an item to the cart
  const addToCart = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated || !hasRole("USER")) {
        toast.error("You do not have permission to add items to the cart.");
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await fetch(
          `${API_URL}/cart/add?productId=${productId}&quantity=${quantity}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add item to cart.");
        }

        const updatedCart = await response.json();
        dispatch({ type: "ADD_ITEM", payload: updatedCart.items || [] });
        toast.success("Item added to cart.");
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error("Failed to add item to cart.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [isAuthenticated, token, hasRole]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!isAuthenticated || !hasRole("USER")) {
        toast.error(
          "You do not have permission to remove items from the cart."
        );
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to remove item from cart."
          );
        }

        const updatedCart = await response.json();

        dispatch({ type: "REMOVE_ITEM", payload: updatedCart.items || [] });
        toast.success("Item removed from cart.");
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error(error.message || "Failed to remove item from cart.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [isAuthenticated, token, hasRole]
  );

  // Update the quantity of an item in the cart
  const updateQuantity = useCallback(
    async (itemId, quantityChange) => {
      if (!isAuthenticated || !hasRole("USER")) {
        toast.error("You do not have permission to update cart items.");
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await fetch(
          `${API_URL}/cart/update/${itemId}?quantity=${quantityChange}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update item quantity.");
        }

        const updatedCart = await response.json();
        dispatch({ type: "UPDATE_QUANTITY", payload: updatedCart || [] });
        toast.success("Cart updated successfully.");
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
        toast.error("Failed to update item quantity.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [isAuthenticated, token, hasRole]
  );

  // Clear the entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to clear the cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart.");
      }

      dispatch({ type: "CLEAR_CART" });
      toast.success("Cart cleared successfully.");
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast.error("Failed to clear cart.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isAuthenticated, token, hasRole]);

  // Fetch the cart when the component mounts or the user logs in
  useEffect(() => {
    if (isAuthenticated && hasRole("USER")) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart, hasRole]);

  // Calculate the total price of the cart
  const totalPrice = state.cart.reduce((total, item) => {
    return total + (item.product?.price || 0) * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        loading: state.loading,
        error: state.error,
        totalPrice,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };
