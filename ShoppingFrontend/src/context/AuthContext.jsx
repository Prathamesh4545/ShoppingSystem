import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Check for an existing token and user data on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!isTokenExpired(token)) {
        setUser(parsedUser);
      } else {
        logout(); // Clear expired token and user data
      }
    }
  }, []);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode token payload
      return payload.exp * 1000 < Date.now(); // Check expiry time
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Treat invalid tokens as expired
    }
  };

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    return !!token && !isTokenExpired(token);
  }, []);

  // Save user data and token to localStorage
  const saveUserData = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  // Clear user data and token from localStorage
  const clearUserData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // User login
  const login = useCallback(async (userName, password) => {
    if (user) {
      setError('You are already logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      if (response.ok) {
        const token = await response.text();
        const user = { userName };
        saveUserData(user, token);
        setSuccessMessage('Login successful!');
        setUser(user);
        navigate('/'); // Redirect to home page after login
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  // User logout
  const logout = useCallback(() => {
    setUser(null);
    clearUserData();
    navigate('/'); // Redirect to home page after logout
  }, [navigate]);

  // Auto-clear error and success messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000); // Clear messages after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Value provided to the context
  const value = {
    user,
    isLoading,
    error,
    successMessage,
    login,
    logout,
    isAuthenticated,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => React.useContext(AuthContext);