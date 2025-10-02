import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaUser } from 'react-icons/fa';

const Avatar = ({
  src,
  alt,
  size = 'md',
  variant = 'circle',
  status,
  className = '',
}) => {
  const { isDark } = useTheme();

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const variants = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    rounded: 'rounded-xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const getStatusSize = (avatarSize) => {
    switch (avatarSize) {
      case 'xs':
        return 'xs';
      case 'sm':
        return 'sm';
      case 'md':
        return 'md';
      case 'lg':
        return 'lg';
      case 'xl':
        return 'xl';
      case '2xl':
        return '2xl';
      default:
        return 'md';
    }
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} ${variants[variant]} ${className}`}
          onError={(e) => {
            e.target.src = '';
            e.target.parentElement.innerHTML = `
              <div class="${sizes[size]} ${variants[variant]} ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } flex items-center justify-center ${className}">
                <FaUser class="${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                } w-1/2 h-1/2" />
              </div>
            `;
          }}
        />
      ) : (
        <div
          className={`${sizes[size]} ${variants[variant]} ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          } flex items-center justify-center ${className}`}
        >
          <FaUser
            className={`${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } w-1/2 h-1/2`}
          />
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full border-2 ${
            isDark ? 'border-gray-800' : 'border-white'
          } ${statusColors[status]} ${statusSizes[getStatusSize(size)]}`}
        />
      )}
    </div>
  );
};

export default Avatar; 