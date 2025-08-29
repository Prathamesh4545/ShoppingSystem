import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: FiCheck,
    error: FiX,
    warning: FiAlertCircle,
    info: FiInfo
  };

  const colors = {
    success: 'from-emerald-500 to-teal-600',
    error: 'from-red-500 to-pink-600',
    warning: 'from-amber-500 to-orange-600',
    info: 'from-blue-500 to-indigo-600'
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  const Icon = icons[type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed z-50 ${positionClasses[position]}`}
        >
          <div className={`
            relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-2xl
            ${bgColors[type]}
            max-w-sm w-full p-4
          `}>
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colors[type]} opacity-5`} />
            
            {/* Content */}
            <div className="relative flex items-start gap-3">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${colors[type]} 
                flex items-center justify-center text-white shadow-lg
              `}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {message}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <FiX className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            
            {/* Progress bar */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colors[type]} rounded-full`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message) => addToast({ message, type: 'success' });
  const showError = (message) => addToast({ message, type: 'error' });
  const showWarning = (message) => addToast({ message, type: 'warning' });
  const showInfo = (message) => addToast({ message, type: 'info' });

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default Toast;