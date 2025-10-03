import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { DataContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./Product/ProductCard";
import ThemeContext from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaArrowLeft,
  FaFilter,
  FaSort,
  FaSearch,
  FaFire,
  FaStar,
  FaClock,
  FaTag,
  FaPercent,
} from "react-icons/fa";

const Home = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { products, loading: isLoading, error } = useContext(DataContext);
  const { addToCart } = useCart();
  const { isAuthenticated, token, logout, refreshToken, isTokenExpired } =
    useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDealProducts, setSelectedDealProducts] = useState([]);
  const [isDealView, setIsDealView] = useState(false);
  const [activeDeals, setActiveDeals] = useState([]);
  const [isDealLoading, setIsDealLoading] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch active deals
  const fetchActiveDeals = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/active`, {
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

  useEffect(() => {
    fetchActiveDeals();
  }, [fetchActiveDeals]);

  // Fetch deal products
  const fetchDealProducts = useCallback(
    async (dealId, token) => {
      setIsDealLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/deals/${dealId}/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
              return fetchDealProducts(dealId, newToken);
            } else {
              logout();
              return;
            }
          }
          throw new Error("Failed to fetch deal products");
        }

        const data = await response.json();
        setSelectedDealProducts(data);
        // Find and set the current deal
        const deal = activeDeals.find((d) => d.id === dealId);
        setCurrentDeal(deal);
      } catch (err) {
        toast.error("Failed to fetch deal products");
      } finally {
        setIsDealLoading(false);
      }
    },
    [refreshToken, logout, activeDeals]
  );

  // Check for dealId in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dealId = queryParams.get("dealId");

    if (dealId) {
      setIsDealView(true);
      if (token && !isTokenExpired(token)) {
        fetchDealProducts(dealId, token);
      } else {
        refreshToken().then((newToken) => {
          if (newToken) {
            fetchDealProducts(dealId, newToken);
          } else {
            logout();
          }
        });
      }
    } else {
      setIsDealView(false);
      setCurrentDeal(null);
    }
  }, [
    location.search,
    token,
    fetchDealProducts,
    refreshToken,
    logout,
    isTokenExpired,
  ]);

  // Optimized Category List
  const categories = useMemo(() => {
    try {
      return [
        "All",
        ...(products ? [...new Set(products.map((p) => p.category))] : []),
      ];
    } catch (err) {
      toast.error("Failed to load categories. Please try again.");
      return ["All"];
    }
  }, [products]);

  // Apply discount to products based on active deals
  const applyDiscount = useCallback(
    (product) => {
      if (!product.deals || product.deals.length === 0) return parseFloat(product.price) || 0;
      
      const activeDeal = product.deals.find((deal) => {
        if (!deal.isActive) return false;
        const now = new Date();
        const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
        const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);
        return now >= startDateTime && now <= endDateTime;
      });
      
      const price = parseFloat(product.price) || 0;
      if (activeDeal && activeDeal.discountPercentage) {
        const discount = parseFloat(activeDeal.discountPercentage) || 0;
        return price * (1 - discount / 100);
      }
      return price;
    },
    []
  );

  // Optimized Product Filtering with Sorting
  const filteredProducts = useMemo(() => {
    let filtered = isDealView
      ? selectedDealProducts.map((product) => ({
          ...product,
          discountedPrice: applyDiscount(product),
          dealInfo: currentDeal,
        }))
      : (selectedCategory === "All"
          ? products || []
          : (products || []).filter((product) => product.category === selectedCategory)
        )
          .filter((product) => product && !isNaN(parseFloat(product.price)))
          .map((product) => {
            const activeDeal = product.deals?.find((deal) => {
              if (!deal || !deal.isActive) return false;
              try {
                const now = new Date();
                const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
                const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);
                return now >= startDateTime && now <= endDateTime;
              } catch (e) {
                console.error('Error parsing deal dates:', e);
                return false;
              }
            });
            return {
              ...product,
              discountedPrice: applyDiscount(product),
              dealInfo: activeDeal || null,
            };
          });

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        return [...filtered].sort(
          (a, b) => a.discountedPrice - b.discountedPrice
        );
      case "price_desc":
        return [...filtered].sort(
          (a, b) => b.discountedPrice - a.discountedPrice
        );
      case "newest":
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "popular":
        return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return filtered;
    }
  }, [
    isDealView,
    selectedDealProducts,
    products,
    selectedCategory,
    applyDiscount,
    currentDeal,
    activeDeals,
    sortBy,
  ]);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle back to all products
  const handleBackToAll = useCallback(() => {
    setIsDealView(false);
    setCurrentDeal(null);
    navigate("/");
  }, [navigate]);

  // Handle quick link clicks
  const handlePopularClick = useCallback(() => {
    setSortBy("popular");
    navigate("/");
  }, [setSortBy, navigate]);

  const handleNewestClick = useCallback(() => {
    setSortBy("newest");
    navigate("/");
  }, [setSortBy, navigate]);

  const handleDealsClick = useCallback(() => {
    navigate("/deals");
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Loading State
  if (isLoading || isDealLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3B82F6" size={50} />
      </div>
    );
  }

  // Error Handling
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-500 text-lg font-semibold">
          Error: {error?.message || "Something went wrong."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          aria-label="Retry"
        >
          Retry
        </button>
      </div>
    );
  }

  // No Products Found
  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <img
          src="/images/no-products.webp"
          alt="No products available"
          className="w-48 h-48 opacity-70"
        />
        <p className="mt-4 text-xl text-gray-800 dark:text-gray-200">
          No products available.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`pt-16 min-h-screen ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Shop the{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Future
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Explore exceptional deals on premium products. Shop with assurance and take advantage of exclusive discounts.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            To utilize our platform, please ensure you are logged in or registered.
          </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Deal View Header */}
      {isDealView && currentDeal && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`relative overflow-hidden backdrop-blur-2xl border-b-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-900/95 via-purple-900/60 to-blue-900/60 border-purple-500/30'
              : 'bg-gradient-to-r from-white via-purple-50/50 to-blue-50/50 border-purple-300/50'
          } shadow-2xl py-8`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4 flex-1">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBackToAll}
                  className={`p-4 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 group ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-purple-400'
                  } shadow-xl hover:shadow-2xl`}
                >
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </motion.button>
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 animate-pulse"></div>
                      <FaFire className="relative text-3xl text-orange-500" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                      {currentDeal.title}
                    </h2>
                  </motion.div>
                  <div className="flex flex-wrap items-center gap-4 ml-12">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20">
                      <FaClock className="text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valid till {new Date(currentDeal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20">
                      <FaTag className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedDealProducts.length} Products
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative flex items-center gap-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 px-8 py-5 rounded-2xl shadow-2xl">
                  <FaPercent className="w-8 h-8 text-white" />
                  <div className="text-white">
                    <div className="text-5xl font-bold leading-none">{currentDeal.discountPercentage}%</div>
                    <div className="text-sm font-semibold tracking-wider mt-1">DISCOUNT</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Deal Description */}
            {currentDeal.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 ml-16 max-w-3xl"
              >
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {currentDeal.description}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      {!isDealView && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 sticky top-16 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Category Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <FaSort className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    text-gray-700 dark:text-gray-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#3B82F6" size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ProductCard
                  product={product}
                  addToCart={addToCart}
                  isAuthenticated={isAuthenticated}
                  discountedPrice={product.discountedPrice}
                  dealInfo={product.dealInfo}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FaSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={handleDealsClick}
            >
              <FaFire className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Hot Deals
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Limited time offers
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={handlePopularClick}
            >
              <FaStar className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Best Sellers
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Top rated products
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={handleNewestClick}
            >
              <FaClock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                New Arrivals
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latest products
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
              onClick={handleDealsClick}
            >
              <FaTag className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Special Offers
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exclusive discounts
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Home);
