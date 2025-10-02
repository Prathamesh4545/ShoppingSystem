import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuest } from '../../context/GuestContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const { guestUser } = useGuest();
  const location = useLocation();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !guestUser && !notificationShown.current) {
      toast.info('Please login first to access this page');
      notificationShown.current = true;
    }
  }, [isAuthenticated, guestUser]);

  // Allow access if user is authenticated and has required role
  if (isAuthenticated) {
    if (roles.length === 0 || roles.includes(user.role)) {
      return children;
    }
  }

  // Allow access for guest users on specific routes (like checkout)
  if (guestUser && location.pathname === '/checkout') {
    return children;
  }

  // Redirect to home page if not authenticated
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default PrivateRoute; 