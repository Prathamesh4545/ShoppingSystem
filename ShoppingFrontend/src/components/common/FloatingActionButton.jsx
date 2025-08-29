import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaComments, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const FloatingActionButton = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const { colors, shadows } = theme;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actions = [
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      color: '#25D366',
      onClick: () => console.log('Open WhatsApp')
        // window.open('https://wa.me/1234567890', '_blank')
    },
    {
      icon: FaPhone,
      label: 'Call Us',
      color: colors.primary.DEFAULT,
      onClick: () => console.log('Make a call')
        // window.open('tel:+1234567890')
    },
    {
      icon: FaComments,
      label: 'Live Chat',
      color: colors.secondary.DEFAULT,
      onClick: () => console.log('Open chat')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-3">
        {/* Action Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col space-y-2"
            >
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.onClick}
                  className="flex items-center space-x-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  style={{ boxShadow: shadows.lg }}
                >
                  <action.icon 
                    className="w-5 h-5" 
                    style={{ color: action.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.secondary.DEFAULT})`,
            boxShadow: shadows.lg
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaComments className="w-6 h-6 text-white" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingActionButton;