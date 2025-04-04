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
  FaClock,
  FaPercent,
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
  const { isDark } = useContext(ThemeContext);
  const { products } = useContext(DataContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeDeals, setActiveDeals] = useState([]);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // Fetch active deals
  const fetchActiveDeals = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            return fetchActiveDeals();
          } else {
            logout();
            return;
          }
        }
        throw new Error("Failed to fetch active deals");
      }

      const data = await response.json();
      setActiveDeals(data);
    } catch (err) {
      toast.error("Failed to fetch active deals");
    }
  }, [token, refreshToken, logout]);

  const fetchProduct = useCallback(async () => {
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

      const [productResponse, dealsResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/product/${id}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch("http://localhost:8080/api/deals/active", {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
      ]);

      if (!productResponse.ok) {
        throw new Error("Failed to fetch product");
      }

      const productData = await productResponse.json();
      setProduct(productData);
      setMainImage(productData.images?.[0]?.imageData || "");

      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        const deal = dealsData.find((deal) =>
          deal.products?.some((p) => p.id === productData.id)
        );
        if (deal) {
          setCurrentDeal(deal);
          setDiscountedPrice(
            productData.price * (1 - deal.discountPercentage / 100)
          );
        } else {
          setDiscountedPrice(productData.price);
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching product data");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, logout, isTokenExpired, token, refreshToken]);

  useEffect(() => {
    fetchActiveDeals();
  }, [fetchActiveDeals]);

  useEffect(() => {
    if (activeDeals.length > 0) {
      fetchProduct();
    }
  }, [activeDeals, fetchProduct]);

  // In Product.jsx
  useEffect(() => {
    const fetchProductWithDeals = async () => {
      try {
        const [productRes, dealsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/product/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/deals/active", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const productData = await productRes.json();
        const dealsData = await dealsRes.json();

        // Find deals containing this product
        const productDeal = dealsData.find((deal) =>
          deal.products?.some((p) => p.id === productData.id)
        );

        setProduct(productData);
        setCurrentDeal(productDeal);
        setDiscountedPrice(
          productDeal
            ? productData.price * (1 - productDeal.discountPercentage / 100)
            : productData.price
        );
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductWithDeals();
  }, [id, token]);

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

  return (
    <div
      className={`min-h-screen pt-20 bg-gradient-to-br ${
        isDark ? "from-gray-900 to-gray-800" : "from-gray-50 to-gray-100"
      }`}
    >
      {currentDeal && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/")}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentDeal.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Valid till{" "}
                    {new Date(currentDeal.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark px-4 py-2 rounded-full shadow-lg"
              >
                <FaTag className="w-5 h-5 text-white" />
                <span className="text-lg font-semibold text-white">
                  {currentDeal.discountPercentage}% OFF
                </span>
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
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
              <motion.img
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={
                  mainImage
                    ? `data:${product.images?.[0]?.imageType};base64,${mainImage}`
                    : "/images/placeholder.webp"
                }
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
                      src={`data:${image.imageType};base64,${image.imageData}`}
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
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.productName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                SKU: {product.sku || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{discountedPrice.toFixed(2)}
                </span>
                {currentDeal && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {currentDeal && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <FaTag className="text-sm" />
                  <span>{currentDeal.discountPercentage}% OFF</span>
                  <span className="text-sm">
                    • Ends in{" "}
                    {new Date(currentDeal.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">{product.desc}</p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-700 dark:text-gray-300">
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
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                product.quantity <= 0 || isAddingToCart
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FaTruck className="w-5 h-5 text-blue-500" />
                <span>Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FaShieldAlt className="w-5 h-5 text-green-500" />
                <span>Secure Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Product;