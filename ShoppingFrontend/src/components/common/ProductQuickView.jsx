import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaHeart, FaStar, FaShare } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ProductQuickView = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;

  if (!product) return null;

  const bgColor = isDark ? colors.background.dark.secondary : colors.background.light.primary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;

  const handleAddToCart = () => {
    onAddToCart?.(product.id, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ backgroundColor: bgColor, boxShadow: shadows.xl }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                Quick View
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaTimes className="w-5 h-5" style={{ color: textColor }} />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: colors.background.light.tertiary }}>
                  <img
                    src={product.images?.[selectedImage]?.imageUrl || 'https://placehold.co/400x400'}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images?.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
                    {product.productName}
                  </h1>
                  <p className="text-lg" style={{ color: colors.text.dark.secondary }}>
                    {product.brand}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < 4 ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: colors.text.dark.secondary }}>
                    (4.0) 128 reviews
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold" style={{ color: colors.primary.DEFAULT }}>
                    ${product.discountedPrice || product.price}
                  </span>
                  {product.discountedPrice && (
                    <span className="text-xl line-through" style={{ color: colors.text.dark.tertiary }}>
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ color: colors.text.dark.secondary }}>
                  {product.desc || 'No description available.'}
                </p>

                {/* Quantity */}
                <div className="flex items-center space-x-4">
                  <span style={{ color: textColor }}>Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-2" style={{ color: textColor }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: colors.primary.DEFAULT }}
                  >
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </motion.button>
                  
                  <button className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaHeart className="w-5 h-5" />
                  </button>
                  
                  <button className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaShare className="w-5 h-5" />
                  </button>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span style={{ color: textColor }}>
                    {product.available ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;