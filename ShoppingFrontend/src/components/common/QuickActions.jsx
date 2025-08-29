import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaShare, FaEye, FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { useContext } from 'react';
import ThemeContext from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const QuickActions = ({ product, onQuickView }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const [actionLoading, setActionLoading] = useState(null);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!product?.id) {
      toast.error('Product information is missing');
      return;
    }
    
    setActionLoading('cart');
    try {
      await addToCart(product.id, 1);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (!product?.id) {
      toast.error('Product information is missing');
      return;
    }
    // TODO: Implement wishlist functionality
    toast.info('Wishlist feature coming soon!');
  };

  const handleShare = async () => {
    if (!product) {
      toast.error('Product information is missing');
      return;
    }
    
    setActionLoading('share');
    const shareData = {
      title: product.productName || 'Product',
      text: product.description || 'Check out this product!',
      url: `${window.location.origin}/product/${product.id}`
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Product link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share product');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const actions = [
    {
      id: 'cart',
      icon: FaShoppingCart,
      label: 'Add to Cart',
      onClick: handleAddToCart,
      color: 'text-blue-500',
      hoverColor: 'hover:text-blue-600'
    },
    {
      id: 'wishlist',
      icon: FaHeart,
      label: 'Wishlist',
      onClick: handleWishlist,
      color: 'text-red-500',
      hoverColor: 'hover:text-red-600'
    },
    {
      id: 'view',
      icon: FaEye,
      label: 'Quick View',
      onClick: () => {
        if (!product?.id) {
          toast.error('Product information is missing');
          return;
        }
        onQuickView?.(product);
      },
      color: 'text-purple-500',
      hoverColor: 'hover:text-purple-600'
    },
    {
      id: 'share',
      icon: FaShare,
      label: 'Share',
      onClick: handleShare,
      color: 'text-green-500',
      hoverColor: 'hover:text-green-600'
    }
  ];

  return (
    <div className="flex justify-center space-x-2 p-4">
      {actions.map((action) => {
        const isLoading = actionLoading === action.id;
        const IconComponent = isLoading ? FaSpinner : action.icon;
        
        return (
          <motion.button
            key={action.id}
            whileHover={!isLoading ? { scale: 1.1, y: -2 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            onClick={action.onClick}
            disabled={isLoading || loading}
            className={`p-3 rounded-full transition-all duration-300 group relative shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <IconComponent 
              className={`w-5 h-5 transition-colors duration-300 ${action.color} ${action.hoverColor} ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            
            {/* Tooltip */}
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
            }`}>
              {isLoading ? 'Loading...' : action.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
};

export default QuickActions;