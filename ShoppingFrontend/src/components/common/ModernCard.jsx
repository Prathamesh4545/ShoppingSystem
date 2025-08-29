import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'lg',
  shadow = 'md',
  rounded = 'lg',
  gradient = false,
  glassmorphism = false,
  ...props 
}) => {
  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;

  const paddingMap = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl']
  };

  const shadowMap = {
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl
  };

  const roundedMap = {
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    '2xl': borderRadius['2xl']
  };

  const getBackgroundStyle = () => {
    if (glassmorphism) {
      return {
        backgroundColor: isDark 
          ? 'rgba(31, 41, 55, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
      };
    }
    
    if (gradient) {
      return {
        background: isDark
          ? `linear-gradient(135deg, ${colors.background.dark.secondary}, ${colors.background.dark.tertiary})`
          : `linear-gradient(135deg, ${colors.background.light.primary}, ${colors.background.light.secondary})`
      };
    }
    
    return {
      backgroundColor: isDark 
        ? colors.background.dark.secondary 
        : colors.background.light.primary
    };
  };

  const cardStyle = {
    padding: paddingMap[padding],
    borderRadius: roundedMap[rounded],
    boxShadow: shadowMap[shadow],
    transition: 'all 0.3s ease',
    ...getBackgroundStyle()
  };

  const MotionComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { 
      y: -5, 
      scale: 1.02,
      boxShadow: shadowMap.xl
    },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  } : {};

  return (
    <MotionComponent
      style={cardStyle}
      className={`${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default ModernCard;