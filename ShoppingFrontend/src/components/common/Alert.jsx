import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes,
} from 'react-icons/fa';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  showCloseButton = true,
  className = '',
}) => {
  const { isDark } = useTheme();

  const variants = {
    success: {
      icon: <FaCheckCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-green-900/50 text-green-200 border-green-800'
        : 'bg-green-50 text-green-800 border-green-200',
    },
    error: {
      icon: <FaTimesCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-red-900/50 text-red-200 border-red-800'
        : 'bg-red-50 text-red-800 border-red-200',
    },
    warning: {
      icon: <FaExclamationCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-yellow-900/50 text-yellow-200 border-yellow-800'
        : 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    info: {
      icon: <FaInfoCircle className="w-5 h-5" />,
      styles: isDark
        ? 'bg-blue-900/50 text-blue-200 border-blue-800'
        : 'bg-blue-50 text-blue-800 border-blue-200',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg border p-4 ${variants[type].styles} ${className}`}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">{variants[type].icon}</div>
        )}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className="mt-2 text-sm">
            {message}
          </div>
        </div>
        {showCloseButton && onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDark
                  ? 'text-gray-400 hover:text-gray-300 focus:ring-gray-500'
                  : 'text-gray-500 hover:text-gray-400 focus:ring-gray-400'
              }`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Alert; 