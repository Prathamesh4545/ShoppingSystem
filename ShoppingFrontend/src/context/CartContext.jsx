import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
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
    case "UPDATE_DEALS":
      return {
        ...state,
        cart: state.cart.map(item => ({
          ...item,
          product: {
            ...item.product,
            dealInfo: action.payload.find(deal => 
              deal.products?.some(p => p.id === item.product.id)
            )
          }
        }))
      };
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

  const handleApiError = useCallback((error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       defaultMessage;
    dispatch({ type: "SET_ERROR", payload: errorMessage });
    toast.error(errorMessage);
    return errorMessage;
  }, []);



  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !hasRole("USER")) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await axios.get(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch({ type: "SET_CART", payload: response.data.items || [] });
    } catch (error) {
      handleApiError(error, "Failed to load cart");
    }
  }, [isAuthenticated, token, hasRole, handleApiError]);

  const addToCart = useCallback(async (productId, quantity) => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to add items to the cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await axios.post(
        `${API_URL}/cart/add?productId=${productId}&quantity=${quantity}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchCart();
      toast.success("Item added to cart successfully!");
    } catch (error) {
      handleApiError(error, "Failed to add item to cart");
    }
  }, [isAuthenticated, token, hasRole, handleApiError, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to remove items from cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await axios.delete(
        `${API_URL}/cart/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({ type: "REMOVE_ITEM", payload: response.data.items });
      toast.success("Item removed from cart successfully!");
    } catch (error) {
      handleApiError(error, "Failed to remove item from cart");
    }
  }, [isAuthenticated, token, hasRole, handleApiError]);

  const updateQuantity = useCallback(async (itemId, quantityChange) => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to update cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await axios.put(
        `${API_URL}/cart/update/${itemId}?quantity=${quantityChange}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({ type: "UPDATE_QUANTITY", payload: response.data.items });
      toast.success("Cart updated successfully!");
    } catch (error) {
      handleApiError(error, "Failed to update cart quantity");
    }
  }, [isAuthenticated, token, hasRole, handleApiError]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !hasRole("USER")) {
      toast.error("You do not have permission to clear cart.");
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await axios.delete(`${API_URL}/cart/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({ type: "CLEAR_CART" });
      toast.success("Cart cleared successfully!");
    } catch (error) {
      handleApiError(error, "Failed to clear cart");
    }
  }, [isAuthenticated, token, hasRole, handleApiError]);

  useEffect(() => {
    if (isAuthenticated && hasRole("USER")) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart, hasRole]);

  const totalPrice = useMemo(() => {
    return state.cart.reduce((total, item) => {
      const product = item.product || {};
      const price = product.price || 0;
      const quantity = item.quantity || 0;
      const dealInfo = product.dealInfo;

      const isDealValid = dealInfo && (() => {
        const dealIsActive = dealInfo.active !== undefined ? dealInfo.active : dealInfo.isActive;
        if (!dealIsActive) return false;
        const endDateTime = new Date(`${dealInfo.endDate}T${dealInfo.endTime || '23:59:59'}`);
        return endDateTime > new Date();
      })();

      if (isDealValid) {
        const discountedPrice = price * (1 - dealInfo.discountPercentage / 100);
        return total + (discountedPrice * quantity);
      }

      return total + (price * quantity);
    }, 0);
  }, [state.cart]);

  const contextValue = useMemo(() => ({
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    totalPrice,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [
    state.cart, 
    state.loading, 
    state.error, 
    totalPrice, 
    fetchCart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart
  ]);

  return (
    <CartContext.Provider value={contextValue}>
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