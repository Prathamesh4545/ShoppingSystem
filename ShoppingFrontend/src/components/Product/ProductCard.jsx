import React, { useState, useContext, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTag, FaClock, FaPercent, FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import ThemeContext from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const ProductCard = memo(({ product, addToCart, isAuthenticated, discountedPrice, dealInfo }) => {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const { addToCart: useCartAddToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
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
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const displayPrice = discountedPrice !== undefined ? discountedPrice : product.price;
  const isDiscounted = discountedPrice !== undefined && discountedPrice < product.price;
  const savings = isDiscounted ? product.price - displayPrice : 0;

  // Calculate time remaining for the deal
  const getTimeRemaining = () => {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
        isDarkMode ? 'hover:shadow-gray-700' : 'hover:shadow-gray-200'
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
        <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
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
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <span>Ends in {getTimeRemaining()}</span>
              </div>
            </motion.div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ₹{displayPrice.toFixed(2)}
              </span>
              {isDiscounted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Save ₹{savings.toFixed(2)}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;