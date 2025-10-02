import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated and has admin role
  const hasAdminRole = user?.role === 'ADMIN' || user?.roles?.includes('ADMIN');
  
  if (isAuthenticated && hasAdminRole) {
    return children;
  }

  // Show error only when redirecting
  if (isAuthenticated && !hasAdminRole) {
    toast.error('You do not have permission to access this page');
  }

  // Redirect to unauthorized page
  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
};

export default AdminRoute; 