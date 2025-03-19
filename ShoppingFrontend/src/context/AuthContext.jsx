import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isTokenExpired } from "../utils/auth"; // Ensure this utility function exists

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") ?? null);
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  }, [navigate]);

  // Verify and set authentication state
  const verifyAndSetAuthState = useCallback(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // Check if the token is expired or invalid
    if (!storedToken || !storedUser || isTokenExpired(storedToken)) {
      logout(); // Clear the authentication state
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // Ensure roles are set correctly
      parsedUser.roles = Array.isArray(parsedUser.roles) ? parsedUser.roles : ["USER"];
      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      console.error("Auth state verification failed:", error);
      logout(); // Clear the authentication state
    }
  }, [logout]);

  useEffect(() => {
    verifyAndSetAuthState();
  }, [verifyAndSetAuthState]);

  // Check if the user is authenticated
  const isAuthenticated = useMemo(() => {
    return Boolean(user && token && !isTokenExpired(token));
  }, [user, token]);

  // Check if the user has a specific role
  const hasRole = useCallback((requiredRole) => {
    return user?.roles?.includes(requiredRole) ?? false;
  }, [user?.roles]);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post("http://localhost:8080/api/users/login", credentials);
      console.log("Server Response:", response.data); // Debugging: Log server response

      // Extract user and token from the response
      const { token: authToken, ...userData } = response.data; // Adjust based on server response

      // Validate response
      if (!userData || !authToken) {
        throw new Error("Invalid authentication credentials: User data or token is missing.");
      }

      // Ensure roles are set correctly
      userData.roles = Array.isArray(userData.roles) ? userData.roles : ["USER"];

      // Store user and token in local storage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);

      // Update state
      setUser(userData);
      setToken(authToken);

      // Return data for component to use
      return { user: userData, token: authToken };
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.response?.status === 401) {
        throw new Error("Invalid username or password. Please check your credentials.");
      } else {
        throw new Error(error.response?.data?.message || "Authentication failed. Please try again.");
      }
    }
  }, []); // Removed navigate from dependencies

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/users/refresh-token", {
        token,
      });
      const { token: newToken } = response.data;

      if (!newToken) {
        throw new Error("Failed to refresh token.");
      }

      // Update token in local storage and state
      localStorage.setItem("token", newToken);
      setToken(newToken);

      return newToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  }, [token, logout]);

  // Context value
  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    hasRole,
    login,
    logout,
    refreshToken,
    isTokenExpired,
  }), [user, token, isAuthenticated, hasRole, login, logout, refreshToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};