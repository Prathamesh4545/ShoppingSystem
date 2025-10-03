import React, { useState, useContext, memo, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTag, FaClock, FaPercent, FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import ThemeContext from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { lazyLoadImage } from "../../utils/performance";

const ProductCard = memo(({ product, addToCart, isAuthenticated, discountedPrice, dealInfo }) => {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const { addToCart: useCartAddToCart } = useCart();

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    if (product.quantity <= 0) {
      toast.warning("This product is out of stock.");
      return;
    }
    try {
      await useCartAddToCart(product.id, 1);
      toast.success(`${product.productName} added to cart!`);
    } catch (error) {
      toast.error(error.message || "Failed to add item to cart");
    }
  }, [isAuthenticated, product.id, product.quantity, product.productName, useCartAddToCart]);

  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }, [isAuthenticated, isWishlisted]);

  const priceInfo = useMemo(() => {
    const originalPrice = parseFloat(product.price) || 0;
    const displayPrice = discountedPrice !== undefined && !isNaN(discountedPrice) 
      ? parseFloat(discountedPrice) 
      : originalPrice;
    const isDiscounted = discountedPrice !== undefined && displayPrice < originalPrice;
    const savings = isDiscounted ? originalPrice - displayPrice : 0;
    return { displayPrice, isDiscounted, savings, originalPrice };
  }, [discountedPrice, product.price]);

  const timeRemaining = useMemo(() => {
    if (!dealInfo?.endDate || !dealInfo?.endTime) return null;
    try {
      const endDateTime = new Date(`${dealInfo.endDate}T${dealInfo.endTime}`);
      const now = new Date();
      const diff = endDateTime - now;
      
      if (diff <= 0) return null;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (e) {
      console.error('Error calculating time remaining:', e);
      return null;
    }
  }, [dealInfo?.endDate, dealInfo?.endTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`group relative backdrop-blur-xl rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${
        isDarkMode 
          ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-2xl hover:shadow-blue-500/20' 
          : 'bg-white/70 border-white/40 hover:bg-white/90 shadow-xl hover:shadow-purple-500/20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {dealInfo && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-md opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl font-bold shadow-2xl flex items-center gap-2">
              <FaPercent className="text-xs" />
              <span className="text-base">{dealInfo.discountPercentage}%</span>
            </div>
          </motion.div>
        )}
        {product.featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-yellow-500 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg"
          >
            ⭐ Featured
          </motion.div>
        )}
        {product.trending && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-pink-500 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg"
          >
            🔥 Trending
          </motion.div>
        )}
      </div>

      {/* Wishlist Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWishlist}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <AnimatePresence mode="wait">
          {isWishlisted ? (
            <motion.div
              key="filled"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FaHeart className="w-5 h-5 text-red-500" />
            </motion.div>
          ) : (
            <motion.div
              key="outline"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FaRegHeart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.productName}`}>
        {/* Product Image */}
        <div className="relative w-full h-64 overflow-hidden rounded-t-2xl">
          <motion.img
            className="w-full h-full object-cover"
            src={
              imageError || !product.images?.length || !product.images[0]?.imageData
                ? "/images/placeholder.webp"
                : `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
            }
            alt={product.productName || "Product image"}
            loading="lazy"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.5 }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isDarkMode ? 'from-black/70 to-transparent' : 'from-black/40 to-transparent'
          }`} />
          
          {/* Floating elements on hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex justify-center"
          >
            <div className="backdrop-blur-lg bg-white/20 dark:bg-black/20 rounded-xl px-4 py-2">
              <span className="text-white text-sm font-medium">Quick View</span>
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {product.brand || "Brand"}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviewCount && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {product.productName || "Unnamed Product"}
          </h3>
          
          {/* Product Details */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.color && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                🎨 {product.color}
              </span>
            )}
            {product.size && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                📏 {product.size}
              </span>
            )}
            {product.warranty && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                🛡️ {product.warranty}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          {product.quantity <= (product.stockAlert || 10) && product.quantity > 0 && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/30">
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                ⚠️ Only {product.quantity} left in stock!
              </span>
            </div>
          )}

          {/* Deal Information */}
          {dealInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <FaTag className="text-green-600 dark:text-green-400 text-xs" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{dealInfo.title || "Special Offer"}</span>
              </div>
              {timeRemaining && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <FaClock className="text-orange-600 dark:text-orange-400 text-xs animate-pulse" />
                  </div>
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Ends in {timeRemaining}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Price Section */}
          <div className="mb-4">
            {priceInfo.isDiscounted ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    ₹{priceInfo.displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ₹{priceInfo.originalPrice.toFixed(2)}
                  </span>
                </div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30"
                >
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">You Save</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{priceInfo.savings.toFixed(2)}</span>
                </motion.div>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{priceInfo.displayPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
            className={`group/btn w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden ${
              product.quantity <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/25'
            }`}
          >
            {product.quantity > 0 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <FaShoppingCart className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform" />
                <span className="relative z-10 font-medium">Add to Cart</span>
              </>
            ) : (
              <span className="font-medium text-white">Out of Stock</span>
            )}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;