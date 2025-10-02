import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className = '',
}) => {
  const { isDark } = useTheme();

  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variants = {
    primary: isDark ? 'text-primary-light' : 'text-primary',
    secondary: isDark ? 'text-secondary-light' : 'text-secondary',
    white: 'text-white',
    gray: isDark ? 'text-gray-400' : 'text-gray-500',
  };

  const spinner = (
    <div className={`${sizes[size]} ${variants[variant]} ${className}`}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center">
          {spinner}
          <p className={`mt-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
