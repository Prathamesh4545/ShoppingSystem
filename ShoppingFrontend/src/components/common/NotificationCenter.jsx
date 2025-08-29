import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheck, FaInfo, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const { isDark, colors, shadows } = theme;
  const { notifications, unreadCount, markAsRead, removeNotification, markAllAsRead } = useNotifications();

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheck className="text-green-500" />;
      case 'error': return <FaExclamationCircle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaInfo className="text-blue-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50"
            style={{ 
              backgroundColor: isDark ? colors.background.dark.secondary : colors.background.light.primary,
              boxShadow: shadows.xl
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold" style={{ color: isDark ? colors.text.dark.primary : colors.text.light.primary }}>
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;