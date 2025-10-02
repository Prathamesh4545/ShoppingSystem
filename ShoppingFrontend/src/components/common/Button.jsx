import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const { isDark } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: isDark
      ? 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light'
      : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light',
    secondary: isDark
      ? 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary-light'
      : 'bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary-light',
    outline: isDark
      ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary-light'
      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary-light',
    ghost: isDark
      ? 'text-gray-300 hover:text-white hover:bg-gray-700 focus:ring-gray-500'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400',
    danger: isDark
      ? 'bg-error hover:bg-error-dark text-white focus:ring-error-light'
      : 'bg-error hover:bg-error-dark text-white focus:ring-error-light',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const iconStyles = icon ? 'gap-2' : '';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${iconStyles} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button; 