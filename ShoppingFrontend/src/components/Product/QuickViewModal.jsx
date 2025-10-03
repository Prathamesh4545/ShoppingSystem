import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaStar, FaTruck, FaBox, FaTag } from 'react-icons/fa';
import axios from 'axios';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, isDarkMode }) => {
  const [shippingConfig, setShippingConfig] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchShippingConfig();
      setSelectedImage(0);
    }
  }, [isOpen]);

  const fetchShippingConfig = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipping/config`);
      setShippingConfig(response.data);
    } catch (error) {
      console.warn('Failed to fetch shipping config');
    }
  };

  if (!product) return null;

  const getImageSrc = (imageData, imageType) => {
    return imageData ? `data:${imageType};base64,${imageData}` : "/images/placeholder.webp";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`relative max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl backdrop-blur-xl ${
              isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-110"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-xl">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={getImageSrc(product.images?.[selectedImage]?.imageData, product.images?.[selectedImage]?.imageType)}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                  {product.featured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                  )}
                  {product.trending && (
                    <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🔥 Trending
                    </div>
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <motion.img
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setSelectedImage(idx)}
                        src={getImageSrc(img.imageData, img.imageType)}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`w-20 h-20 rounded-xl object-cover cursor-pointer transition-all ${
                          selectedImage === idx 
                            ? 'ring-4 ring-blue-500 shadow-lg' 
                            : 'ring-2 ring-gray-300 dark:ring-gray-600 hover:ring-blue-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                      {product.brand}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                        <FaStar className="text-yellow-500" />
                        <span className="font-bold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                        {product.reviewCount && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">({product.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {product.productName}
                  </h2>
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      ₹{product.price}
                    </p>
                    {product.category && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">in {product.category}</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">{product.desc}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaBox className="text-blue-500" />
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.color && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Color</span>
                        <p className="font-bold text-gray-900 dark:text-white">{product.color}</p>
                      </div>
                    )}
                    {product.size && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Size</span>
                        <p className="font-bold text-gray-900 dark:text-white">{product.size}</p>
                      </div>
                    )}
                    {product.material && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Material</span>
                        <p className="font-bold text-gray-900 dark:text-white">{product.material}</p>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Warranty</span>
                        <p className="font-bold text-gray-900 dark:text-white">{product.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border-2 ${
                    product.quantity > 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full animate-pulse ${
                        product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {product.quantity > 0 ? `✓ ${product.quantity} Available` : '✗ Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {shippingConfig && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <FaTruck className="text-blue-600 dark:text-blue-400 text-xl mt-1" />
                        <div className="flex-1 space-y-2">
                          <p className="font-bold text-gray-900 dark:text-white">Shipping Information</p>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-semibold">Standard:</span> ₹{product.customShippingFee || shippingConfig.standardShippingFee}
                              {product.customShippingFee && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs">Custom</span>
                              )}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">⏱️ Delivery in {shippingConfig.standardDeliveryDays} days</p>
                            {shippingConfig.freeShippingEnabled && (
                              <p className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                <FaTag /> FREE on orders ₹{shippingConfig.freeShippingThreshold}+
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onAddToCart(product.id);
                      onClose();
                    }}
                    disabled={product.quantity <= 0}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
                      product.quantity <= 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    }`}
                  >
                    <FaShoppingCart className="text-xl" />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = `/product/${product.id}`}
                    className="px-6 py-4 rounded-xl font-bold text-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                  >
                    Details
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
