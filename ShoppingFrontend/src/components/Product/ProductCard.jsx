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
    const displayPrice = discountedPrice !== undefined ? discountedPrice : product.price;
    const isDiscounted = discountedPrice !== undefined && discountedPrice < product.price;
    const savings = isDiscounted ? product.price - displayPrice : 0;
    return { displayPrice, isDiscounted, savings };
  }, [discountedPrice, product.price]);

  const timeRemaining = useMemo(() => {
    if (!dealInfo?.endDate) return null;
    const endDate = new Date(dealInfo.endDate);
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [dealInfo?.endDate]);

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
      {/* Deal Badge */}
      {dealInfo && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
            <FaTag className="text-xs" />
            {dealInfo.discountPercentage}% OFF
          </div>
        </motion.div>
      )}

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {product.productName || "Unnamed Product"}
          </h3>

          {/* Deal Information */}
          {dealInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 mb-3"
            >
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <FaTag className="text-xs" />
                <span>{dealInfo.title || "Special Offer"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <FaClock className="text-xs" />
                <span>Ends in {timeRemaining}</span>
              </div>
            </motion.div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ₹{priceInfo.displayPrice.toFixed(2)}
              </span>
              {priceInfo.isDiscounted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Save ₹{priceInfo.savings.toFixed(2)}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="group/btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <FaShoppingCart className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform" />
            <span className="relative z-10 font-medium">Add to Cart</span>
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;