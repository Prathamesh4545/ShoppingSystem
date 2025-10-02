import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const { isDark } = useTheme();

  const variants = {
    default: {
      container: isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200',
      tab: isDark
        ? 'text-gray-300 hover:text-white'
        : 'text-gray-500 hover:text-gray-900',
      active: isDark
        ? 'text-white border-primary'
        : 'text-primary border-primary',
    },
    underline: {
      container: 'border-b',
      tab: isDark
        ? 'text-gray-300 hover:text-white'
        : 'text-gray-500 hover:text-gray-900',
      active: isDark
        ? 'text-white border-primary'
        : 'text-primary border-primary',
    },
    pills: {
      container: isDark
        ? 'bg-gray-800 p-1'
        : 'bg-gray-100 p-1',
      tab: isDark
        ? 'text-gray-300 hover:text-white'
        : 'text-gray-500 hover:text-gray-900',
      active: isDark
        ? 'text-white bg-primary'
        : 'text-white bg-primary',
    },
  };

  const getTabStyles = (isActive) => {
    const baseStyles = 'px-4 py-2 text-sm font-medium transition-colors duration-200';
    const variantStyles = variants[variant];

    if (variant === 'underline') {
      return `${baseStyles} ${
        isActive
          ? `${variantStyles.active} border-b-2`
          : variantStyles.tab
      }`;
    }

    if (variant === 'pills') {
      return `${baseStyles} rounded-lg ${
        isActive ? variantStyles.active : variantStyles.tab
      }`;
    }

    return `${baseStyles} border-b-2 ${
      isActive ? variantStyles.active : variantStyles.tab
    }`;
  };

  return (
    <div
      className={`${
        variants[variant].container
      } ${className}`}
    >
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={getTabStyles(activeTab === tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </nav>
      {variant === 'default' && (
        <motion.div
          className="h-0.5 bg-primary"
          initial={false}
          animate={{
            width: '100%',
            x: tabs.findIndex((tab) => tab.id === activeTab) * 100 + '%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
};

export default Tabs; 