import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';

const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
}) => {
  const { isDark } = useTheme();

  const variants = {
    success: {
      icon: <FaCheckCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-green-800 text-white'
        : 'bg-green-50 text-green-800 border-green-200',
    },
    error: {
      icon: <FaExclamationCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-red-800 text-white'
        : 'bg-red-50 text-red-800 border-red-200',
    },
    warning: {
      icon: <FaExclamationCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-yellow-800 text-white'
        : 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    info: {
      icon: <FaInfoCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-blue-800 text-white'
        : 'bg-blue-50 text-blue-800 border-blue-200',
    },
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-center': 'bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`fixed z-50 ${positions[position]}`}
      >
        <div
          className={`flex items-center p-4 rounded-lg shadow-lg border ${
            variants[type].styles
          }`}
        >
          <div className="flex-shrink-0">{variants[type].icon}</div>
          <div className="ml-3">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDark
                  ? 'text-white hover:bg-white/10 focus:ring-white'
                  : 'text-gray-500 hover:bg-gray-100 focus:ring-gray-500'
              }`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast; 