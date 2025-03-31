import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestUser, setGuestUser] = useState(null);
  const [guestCart, setGuestCart] = useState([]);

  const createGuestUser = useCallback((userData) => {
    const newGuestUser = {
      id: `guest_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    setGuestUser(newGuestUser);
    return newGuestUser;
  }, []);

  const updateGuestCart = useCallback((cart) => {
    setGuestCart(cart);
  }, []);

  const clearGuestData = useCallback(() => {
    setGuestUser(null);
    setGuestCart([]);
  }, []);

  const value = {
    guestUser,
    guestCart,
    createGuestUser,
    updateGuestCart,
    clearGuestData
  };

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