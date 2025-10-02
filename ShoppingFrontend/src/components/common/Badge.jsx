import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const { isDark } = useTheme();

  const variants = {
    default: isDark
      ? 'bg-gray-700 text-gray-300'
      : 'bg-gray-100 text-gray-800',
    primary: isDark
      ? 'bg-primary text-white'
      : 'bg-primary text-white',
    secondary: isDark
      ? 'bg-secondary text-white'
      : 'bg-secondary text-white',
    success: isDark
      ? 'bg-success text-white'
      : 'bg-success text-white',
    warning: isDark
      ? 'bg-warning text-white'
      : 'bg-warning text-white',
    error: isDark
      ? 'bg-error text-white'
      : 'bg-error text-white',
    info: isDark
      ? 'bg-blue-600 text-white'
      : 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  if (dot) {
    return (
      <span
        className={`inline-block rounded-full ${variants[variant]} ${dotSizes[size]} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge; 