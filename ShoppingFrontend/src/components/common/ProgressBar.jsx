import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ProgressBar = ({ 
  progress = 0, 
  color = 'blue', 
  size = 'md', 
  showLabel = false, 
  label = '', 
  animated = true,
  striped = false,
  className = ''
}) => {
  const theme = useTheme();
  const { colors, borderRadius } = theme;

  const colorMap = {
    blue: colors.primary.DEFAULT,
    green: colors.success.DEFAULT,
    red: colors.error.DEFAULT,
    yellow: colors.warning.DEFAULT,
    purple: colors.secondary.DEFAULT
  };

  const sizeMap = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {clampedProgress}%
          </span>
        </div>
      )}
      
      <div 
        className={`w-full bg-gray-200 dark:bg-gray-700 ${sizeMap[size]} overflow-hidden`}
        style={{ borderRadius: borderRadius.full }}
      >
        <motion.div
          className={`h-full ${striped ? 'bg-striped' : ''}`}
          style={{ 
            backgroundColor: colorMap[color],
            backgroundImage: striped ? `linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)` : 'none',
            backgroundSize: striped ? '1rem 1rem' : 'auto'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: animated ? 1 : 0, 
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;