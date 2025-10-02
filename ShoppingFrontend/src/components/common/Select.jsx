import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Select = ({
  label,
  error,
  icon,
  className = '',
  children,
  ...props
}) => {
  const { isDark } = useTheme();

  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none';
  
  const variants = {
    default: isDark
      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:ring-primary-light'
      : 'bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary-light',
    error: isDark
      ? 'bg-gray-700 border-error text-white focus:border-error focus:ring-error-light'
      : 'bg-white border-error text-gray-900 focus:border-error focus:ring-error-light',
  };

  const selectStyles = `${baseStyles} ${variants[error ? 'error' : 'default']} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {icon}
          </div>
        )}
        <select
          className={`${selectStyles} ${icon ? 'pl-10' : ''}`}
          {...props}
        >
          {children}
        </select>
        <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className={`mt-1 text-sm ${
          isDark ? 'text-error-light' : 'text-error'
        }`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select; 