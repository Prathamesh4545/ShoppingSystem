import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  const { isDark } = useTheme();

  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: isDark
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary-light'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-primary-light',
    error: isDark
      ? 'bg-gray-700 border-error text-white placeholder-gray-400 focus:border-error focus:ring-error-light'
      : 'bg-white border-error text-gray-900 placeholder-gray-500 focus:border-error focus:ring-error-light',
  };

  const inputStyles = `${baseStyles} ${variants[error ? 'error' : 'default']} ${className}`;

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
        <input
          className={`${inputStyles} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
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

export default Input; 