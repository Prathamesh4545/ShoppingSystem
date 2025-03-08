import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isTokenExpired, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("ProtectedRoute component rendered.");

  useEffect(() => {
    console.log("Checking authentication...");

    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      console.log("Token is invalid or expired. Logging out...");
      logout();
      setIsAuthenticated(false);
    } else {
      console.log("Token is valid. User is authenticated.");
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [isTokenExpired, logout]);

  if (isLoading) {
    console.log("Loading authentication state...");
    return <div>Loading...</div>;
  }

  console.log("Authentication state:", isAuthenticated);

  if (!isAuthenticated) {
    console.log("User is not authenticated. Redirecting to login...");
    return <Navigate to="/login" />;
  }

  console.log("User is authenticated. Rendering children...");
  return children; // Render the child components directly
};

export default ProtectedRoute;