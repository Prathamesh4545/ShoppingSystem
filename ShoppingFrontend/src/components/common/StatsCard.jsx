import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  color = 'blue',
  loading = false 
}) => {
  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;

  const colorMap = {
    blue: colors.primary.DEFAULT,
    green: colors.success.DEFAULT,
    red: colors.error.DEFAULT,
    yellow: colors.warning.DEFAULT,
    purple: colors.secondary.DEFAULT
  };

  const bgColor = isDark ? colors.background.dark.secondary : colors.background.light.primary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
  const secondaryTextColor = isDark ? colors.text.dark.secondary : colors.text.light.secondary;

  if (loading) {
    return (
      <div 
        className="p-6 rounded-xl animate-pulse"
        style={{ backgroundColor: bgColor, boxShadow: shadows.md }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-6 rounded-xl transition-all duration-300"
      style={{ 
        backgroundColor: bgColor, 
        boxShadow: shadows.md,
        border: `1px solid ${isDark ? colors.background.dark.tertiary : colors.background.light.tertiary}`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: secondaryTextColor }}>
            {title}
          </p>
          <p className="text-3xl font-bold" style={{ color: textColor }}>
            {value}
          </p>
          {change && (
            <div className="flex items-center space-x-1">
              <span 
                className={`text-sm font-medium ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {changeType === 'positive' ? '+' : ''}{change}%
              </span>
              <span className="text-xs" style={{ color: secondaryTextColor }}>
                vs last month
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: colorMap[color] + '20' }}
          >
            <Icon 
              className="w-6 h-6" 
              style={{ color: colorMap[color] }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;