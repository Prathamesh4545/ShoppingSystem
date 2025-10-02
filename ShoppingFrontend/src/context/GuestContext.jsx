import React, { createContext, useState, useContext, useMemo } from "react";

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestInfo, setGuestInfo] = useState(null);

  const value = useMemo(() => ({
    guestInfo,
    setGuestInfo
  }), [guestInfo]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) throw new Error("useGuest must be used within GuestProvider");
  return context;
};
