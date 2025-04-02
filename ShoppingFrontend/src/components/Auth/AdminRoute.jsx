import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      toast.error('You do not have permission to access this page');
    }
  }, [isAuthenticated, user]);

  // Check if user is authenticated and has admin role
  if (isAuthenticated && user?.role === 'ADMIN') {
    return children;
  }

  // Redirect to unauthorized page
  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
};

export default AdminRoute; 