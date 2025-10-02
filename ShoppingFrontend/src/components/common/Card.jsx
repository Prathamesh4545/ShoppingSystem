import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Card = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const { isDark } = useTheme();

  const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200';
  
  const variants = {
    default: isDark
      ? 'bg-gray-800 border border-gray-700'
      : 'bg-white border border-gray-200',
    elevated: isDark
      ? 'bg-gray-800 shadow-lg hover:shadow-xl'
      : 'bg-white shadow-lg hover:shadow-xl',
    bordered: isDark
      ? 'bg-gray-800 border-2 border-gray-700'
      : 'bg-white border-2 border-gray-200',
    transparent: 'bg-transparent',
  };

  const hoverStyles = hover
    ? isDark
      ? 'hover:bg-gray-750 hover:border-gray-600'
      : 'hover:bg-gray-50 hover:border-gray-300'
    : '';

  const cardContent = (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

const CardHeader = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  
  return (
    <div
      className={`px-6 py-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  
  return (
    <div
      className={`px-6 py-4 border-t ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card; 