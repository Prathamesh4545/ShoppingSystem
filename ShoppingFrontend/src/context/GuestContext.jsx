import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback,
  useMemo  // Add this import
} from 'react';
import { toast } from 'react-toastify';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestUser, setGuestUser] = useState(null);
  const [guestCart, setGuestCart] = useState([]);

  const createGuestUser = useCallback((userData) => {
    try {
      if (!userData?.email) {
        throw new Error("Email is required for guest checkout");
      }

      const newGuestUser = {
        id: `guest_${Date.now()}`,
        email: userData.email,
        name: userData.name || '',
        phone: userData.phone || '',
        isGuest: true,
        createdAt: new Date().toISOString()
      };
      
      setGuestUser(newGuestUser);
      toast.success("Guest session started");
      return newGuestUser;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const updateGuestCart = useCallback((cart) => {
    try {
      if (!Array.isArray(cart)) {
        throw new Error("Invalid cart data format");
      }
      setGuestCart(cart);
    } catch (error) {
      toast.error("Failed to update guest cart");
      console.error(error);
    }
  }, []);

  const clearGuestData = useCallback(() => {
    setGuestUser(null);
    setGuestCart([]);
    toast.info("Guest session cleared");
  }, []);

  // Wrap the context value in useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    guestUser,
    guestCart,
    createGuestUser,
    updateGuestCart,
    clearGuestData
  }), [guestUser, guestCart, createGuestUser, updateGuestCart, clearGuestData]);

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};