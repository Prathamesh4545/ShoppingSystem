import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Dropdown = ({
  trigger,
  items,
  position = 'bottom-right',
  className = '',
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positions = {
    'bottom-right': 'top-full left-0 mt-2',
    'bottom-left': 'top-full right-0 mt-2',
    'top-right': 'bottom-full left-0 mb-2',
    'top-left': 'bottom-full right-0 mb-2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 ${positions[position]} ${className}`}
          >
            <div
              className={`rounded-lg shadow-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {items.map((item, index) => (
                <div key={index}>
                  {item.type === 'divider' ? (
                    <div
                      className={`h-px ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={item.disabled}
                    >
                      <div className="flex items-center">
                        {item.icon && (
                          <span className="mr-2">{item.icon}</span>
                        )}
                        {item.label}
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown; 