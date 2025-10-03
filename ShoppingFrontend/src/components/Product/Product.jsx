import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "flowbite-react";
import {
  FaExclamationCircle,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaTag,
  FaTruck,
  FaShieldAlt,
  FaArrowLeft,
  FaFire,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContext from "../../context/ThemeContext";
import { DataContext } from "../../context/ProductContext";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTokenExpired, logout, token, refreshToken } = useAuth();
  const { addToCart } = useCart();
  const { isDarkMode } = useContext(ThemeContext);
  const { products } = useContext(DataContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [shippingConfig, setShippingConfig] = useState(null);

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          navigate("/");
          return;
        }
      }

      // First fetch the product data
      const productResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/product/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!productResponse.ok) {
        throw new Error("Failed to fetch product");
      }

      const productData = await productResponse.json();
      setProduct(productData);
      setMainImage(productData.images?.[0]?.imageData || "");
      
      // Set the regular price as default
      setDiscountedPrice(productData.price);

      // Then try to fetch deals (but don't block if this fails)
      try {
        const dealsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/active`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          const productDeal = dealsData.find((deal) =>
            deal.products?.some((p) => p.id === productData.id)
          );

          if (productDeal) {
            setCurrentDeal(productDeal);
            setDiscountedPrice(
              productData.price * (1 - productDeal.discountPercentage / 100)
            );
          }
        }
      } catch (dealsError) {
        console.warn("Failed to fetch deals", dealsError);
      }

      // Fetch shipping config
      try {
        const shippingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/shipping/config`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (shippingResponse.ok) {
          const shippingData = await shippingResponse.json();
          setShippingConfig(shippingData);
        }
      } catch (shippingError) {
        console.warn("Failed to fetch shipping config", shippingError);
      }

    } catch (err) {
      setError(err.message || "An error occurred while fetching product data");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, logout, isTokenExpired, token, refreshToken]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleImageChange = (imageUrl, index) => {
    setMainImage(imageUrl);
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > product?.quantity) {
      setQuantity(product.quantity);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.quantity) {
      toast.warning("Not enough stock available.");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.productName} added to cart!`);
    } catch (err) {
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.productName,
        text: product.desc,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getImageSrc = (imageData, imageType) => {
    return imageData ? `data:${imageType};base64,${imageData}` : "/images/placeholder.webp";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-screen text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaExclamationCircle size={32} className="mb-2" />
        <p className="text-lg">{error}</p>
        <motion.button
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
        >
          Go Back to Home
        </motion.button>
      </motion.div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div
      className={`pt-16 min-h-screen ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {currentDeal && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`relative overflow-hidden backdrop-blur-2xl border-b-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-900/95 via-purple-900/60 to-blue-900/60 border-purple-500/30'
              : 'bg-gradient-to-r from-white via-purple-50/50 to-blue-50/50 border-purple-300/50'
          } shadow-2xl py-6`}
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/")}
                  className={`p-3 rounded-xl backdrop-blur-md border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20 hover:bg-white/20'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } shadow-lg hover:shadow-xl`}
                >
                  <FaArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaFire className="text-orange-500 text-xl animate-pulse" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                      {currentDeal.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">
                    Valid till {new Date(currentDeal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-xl opacity-50"></div>
                <div className="relative flex items-center gap-3 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 px-6 py-3 rounded-2xl shadow-2xl">
                  <FaTag className="w-5 h-5 text-white" />
                  <div className="text-white">
                    <div className="text-2xl font-bold leading-none">{currentDeal.discountPercentage}%</div>
                    <div className="text-xs font-semibold">OFF</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/5 dark:bg-black/20 ring-1 ring-gray-200/50 dark:ring-white/10">
              <motion.img
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={getImageSrc(mainImage, product.images?.[0]?.imageType)}
                alt="Product"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/images/placeholder.webp")}
              />
              {currentDeal && (
                <div className="absolute top-4 left-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-lg"
                  >
                    <FaFire className="w-4 h-4" />
                    <span>Deal Active</span>
                  </motion.div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {isWishlisted ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FaShare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              <AnimatePresence>
                {product.images?.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer ${
                      selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleImageChange(image.imageData, index)}
                  >
                    <img
                      src={getImageSrc(image.imageData, image.imageType)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            className="space-y-6 backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-8 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {product.productName}
              </h1>
              {product.sku && (
                <p className="text-gray-600 dark:text-gray-300">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {currentDeal ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      ₹{discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-800/30"
                  >
                    <FaTag className="text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      You Save ₹{(product.price - discountedPrice).toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      ({currentDeal.discountPercentage}% OFF)
                    </span>
                  </motion.div>
                </div>
              ) : (
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  ₹{discountedPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm">
              <p className="text-gray-700 dark:text-white leading-relaxed">{product.desc}</p>
            </div>

            {/* Product Specifications */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.brand && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Brand</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.brand}</p>
                  </div>
                )}
                {product.category && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.category}</p>
                  </div>
                )}
                {product.color && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Color</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.color}</p>
                  </div>
                )}
                {product.size && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Size</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.size}</p>
                  </div>
                )}
                {product.material && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Material</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.material}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Weight</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.weight} kg</p>
                  </div>
                )}
                {product.dimensions && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dimensions</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.dimensions}</p>
                  </div>
                )}
                {product.warranty && (
                  <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Warranty</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.warranty}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rating and Reviews */}
            {product.rating && (
              <div className="p-4 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-2xl ${
                        i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                      }`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</p>
                    {product.reviewCount && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.reviewCount} reviews</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-gray-700 dark:text-white">
                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-700 dark:text-white">
                Quantity:
              </label>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  -
                </motion.button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setQuantity(Math.min(product.quantity, quantity + 1))
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  +
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.quantity <= 0 || isAddingToCart}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white text-lg font-bold transition-all duration-300 ${
                product.quantity <= 0 || isAddingToCart
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02]"
              }`}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : (
                <>
                  <FaShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </motion.button>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-semibold">
                  ⭐ Featured
                </span>
              )}
              {product.trending && (
                <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-semibold">
                  🔥 Trending
                </span>
              )}
              {product.quantity <= (product.stockAlert || 10) && product.quantity > 0 && (
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold">
                  ⚠️ Low Stock
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl backdrop-blur-sm"
              >
                <FaTruck className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-white">Free Shipping</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 p-4 bg-green-50/80 dark:bg-green-900/30 rounded-xl backdrop-blur-sm"
              >
                <FaShieldAlt className="w-6 h-6 text-green-500 dark:text-green-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-white">Secure Payment</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Additional Product Information Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        {/* Product Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-8 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Description</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{product.desc}</p>
        </motion.div>

        {/* Technical Specifications */}
        {(product.brand || product.category || product.sku || product.weight || product.dimensions || product.material) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-8 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.brand && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Brand</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.brand}</p>
                </div>
              )}
              {product.category && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Category</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.category}</p>
                </div>
              )}
              {product.sku && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">SKU</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.sku}</p>
                </div>
              )}
              {product.weight && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Weight</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.weight} kg</p>
                </div>
              )}
              {product.dimensions && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dimensions</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.dimensions}</p>
                </div>
              )}
              {product.material && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Material</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{product.material}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-8 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.color && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                  🎨
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Color</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.color}</p>
                </div>
              </div>
            )}
            {product.size && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-2xl">
                  📏
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.size}</p>
                </div>
              </div>
            )}
            {product.warranty && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Warranty</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.warranty}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping & Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping & Delivery</h2>
          
          {shippingConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Standard Shipping */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🚚</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Standard Delivery</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ₹{product.customShippingFee || shippingConfig.standardShippingFee}
                        </span>
                        <span>shipping fee</span>
                        {product.customShippingFee && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full text-blue-700 dark:text-blue-300">
                            Custom
                          </span>
                        )}
                      </p>
                      <p>⏱️ Delivery in {shippingConfig.standardDeliveryDays} business days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Express Shipping */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl shadow-xl border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚡</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Express Delivery</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">₹{shippingConfig.expressShippingFee}</span>
                        <span>shipping fee</span>
                      </p>
                      <p>⚡ Fast delivery in {shippingConfig.expressDeliveryDays} business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Free Shipping Banner */}
          {shippingConfig?.freeShippingEnabled && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="backdrop-blur-xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl shadow-xl border-2 border-green-300 dark:border-green-700"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎉</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">FREE Shipping Available!</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Get <span className="font-bold text-green-600 dark:text-green-400">FREE delivery</span> on orders above <span className="font-bold text-green-600 dark:text-green-400">₹{shippingConfig.freeShippingThreshold}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl shadow-xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl">↩️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Easy Returns</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">30-day hassle-free return policy</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-6 rounded-2xl shadow-xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔒</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secure Payment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">100% secure payment processing</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer Reviews Section */}
        {product.rating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-8 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{product.rating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${
                      i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                    }`}>
                      ★
                    </span>
                  ))}
                </div>
                {product.reviewCount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.reviewCount} reviews</p>
                )}
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Product;