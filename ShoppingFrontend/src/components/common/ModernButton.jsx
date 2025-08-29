import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ModernButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  glassmorphism = false,
  onClick,
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;

  const variants = {
    primary: {
      bg: colors.primary.DEFAULT,
      hoverBg: colors.primary.dark,
      text: '#FFFFFF',
      border: 'transparent'
    },
    secondary: {
      bg: colors.secondary.DEFAULT,
      hoverBg: colors.secondary.dark,
      text: '#FFFFFF',
      border: 'transparent'
    },
    outline: {
      bg: 'transparent',
      hoverBg: colors.primary.light + '20',
      text: colors.primary.DEFAULT,
      border: colors.primary.DEFAULT
    },
    ghost: {
      bg: 'transparent',
      hoverBg: colors.primary.light + '10',
      text: colors.primary.DEFAULT,
      border: 'transparent'
    },
    danger: {
      bg: colors.error.DEFAULT,
      hoverBg: colors.error.dark,
      text: '#FFFFFF',
      border: 'transparent'
    }
  };

  const sizes = {
    sm: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.sm,
      height: '2rem'
    },
    md: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.base,
      height: '2.5rem'
    },
    lg: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize.lg,
      height: '3rem'
    },
    xl: {
      padding: `${spacing.lg} ${spacing.xl}`,
      fontSize: typography.fontSize.xl,
      height: '3.5rem'
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  const getBackgroundStyle = () => {
    if (disabled) {
      return { backgroundColor: '#9CA3AF' };
    }
    
    if (glassmorphism) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      };
    }
    
    if (gradient && variant === 'primary') {
      return {
        background: `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.secondary.DEFAULT})`
      };
    }
    
    return {
      backgroundColor: currentVariant.bg,
      border: `1px solid ${currentVariant.border}`
    };
  };

  const buttonStyle = {
    ...getBackgroundStyle(),
    color: disabled ? '#FFFFFF' : currentVariant.text,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    height: currentSize.height,
    borderRadius: borderRadius.lg,
    fontWeight: typography.fontWeight.medium,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    transition: 'all 0.2s ease'
  };

  return (
    <motion.button
      style={buttonStyle}
      className={className}
      onClick={disabled || loading ? undefined : onClick}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        backgroundColor: currentVariant.hoverBg 
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      
      {!loading && children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </motion.button>
  );
};

export default ModernButton;