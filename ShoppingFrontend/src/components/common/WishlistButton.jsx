import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const WishlistButton = ({ productId, isInWishlist: initialState = false, onToggle }) => {
  const [isInWishlist, setIsInWishlist] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const { colors } = theme;

  useEffect(() => {
    setIsInWishlist(initialState);
  }, [initialState]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newState = !isInWishlist;
      setIsInWishlist(newState);
      
      if (onToggle) {
        await onToggle(productId, newState);
      }
      
      toast.success(
        newState ? 'Added to wishlist!' : 'Removed from wishlist!',
        { position: 'bottom-right', autoClose: 2000 }
      );
    } catch (error) {
      setIsInWishlist(!isInWishlist);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-full transition-all duration-300 ${
        isInWishlist 
          ? 'bg-red-50 dark:bg-red-900/20' 
          : 'bg-gray-50 dark:bg-gray-800'
      }`}
    >
      <motion.div
        animate={{
          scale: isInWishlist ? [1, 1.3, 1] : 1,
          rotate: isInWishlist ? [0, 10, -10, 0] : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <FaHeart 
          className={`w-4 h-4 transition-colors duration-300 ${
            isInWishlist 
              ? 'text-red-500' 
              : 'text-gray-400 hover:text-red-400'
          }`}
        />
      </motion.div>
    </motion.button>
  );
};

export default WishlistButton;