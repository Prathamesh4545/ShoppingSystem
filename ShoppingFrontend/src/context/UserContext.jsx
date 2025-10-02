import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config/constants";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const value = useMemo(() => ({
    userProfile,
    loading,
    fetchUserProfile,
    setUserProfile
  }), [userProfile, loading, fetchUserProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
