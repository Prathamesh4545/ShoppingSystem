import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    
    setNotifications([newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ 
      type: 'success', 
      title: 'Success',
      message, 
      ...options 
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({ 
      type: 'error', 
      title: 'Error',
      message, 
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ 
      type: 'warning', 
      title: 'Warning',
      message, 
      ...options 
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ 
      type: 'info', 
      title: 'Info',
      message, 
      ...options 
    });
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};