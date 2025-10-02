import React, { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole, user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const hasRequiredRole = useMemo(() => {
    if (!roles || roles.length === 0) return true; 
    return roles.some((role) => hasRole(role));
  }, [roles, hasRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default React.memo(ProtectedRoute);