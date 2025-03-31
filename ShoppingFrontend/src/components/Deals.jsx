import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTag,
  FaClock,
  FaPercent,
  FaGift,
  FaArrowRight,
} from "react-icons/fa";

const DealsPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch active deals
  const fetchDeals = useCallback(async () => {
    if (isTokenExpired(token)) {
      logout();
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the request
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, log out and redirect to login
          logout();
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch deals.");
      }

      const data = await response.json();
      setDeals(data);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy");
  }, []);

  // Check if the deal is currently active
  const isDealActive = useCallback((deal) => {
    const now = new Date();
    const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
    const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);

    return isAfter(now, startDateTime) && isBefore(now, endDateTime);
  }, []);

  // Filter deals to show only active ones
  const activeDeals = useMemo(() => {
    return deals.filter((deal) => isDealActive(deal));
  }, [deals, isDealActive]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchDeals();
  }, [fetchDeals]);

  // Handle "View Products" link click
  const handleViewProducts = (dealId) => {
    navigate(`/?dealId=${dealId}`);
  };

  // Function to get image source
  const getImageSrc = (deal) => {
    if (deal.imageUrl) {
      return deal.imageUrl;
    } else if (deal.imageData && deal.imageType) {
      return `data:${deal.imageType};base64,${deal.imageData}`;
    }
    return "https://placehold.co/600x400?text=No+Image";
  };

  return (
    <div
      className={`pt-16 px-4 md:px-10 lg:px-20 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } min-h-screen`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Special Deals & Offers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover amazing discounts and limited-time offers on our products.
          Don't miss out on these exclusive deals!
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 py-4"
        >
          <p>Error: {error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-200"
          >
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : Array.isArray(activeDeals) && activeDeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {activeDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl shadow-lg backdrop-blur-lg ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                } hover:shadow-xl transition-all duration-300`}
              >
                {/* Deal Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <FaPercent className="text-xs" />
                    {deal.discountPercentage}% OFF
                  </div>
                </motion.div>

                {/* Deal Image */}
                <div className="relative h-48 overflow-hidden">
                  <LazyLoadImage
                    src={getImageSrc(deal)}
                    alt={deal.title}
                    effect="blur"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    placeholderSrc="https://placehold.co/600x400?text=Loading..."
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Deal Content */}
                <div className="p-6">
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {deal.title}
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-4 line-clamp-2`}
                  >
                    {deal.description}
                  </p>

                  {/* Deal Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaClock className="text-blue-500" />
                      <span>
                        Valid from {formatDate(deal.startDate)} to{" "}
                        {formatDate(deal.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaGift className="text-green-500" />
                      <span>{deal.products?.length || 0} Products</span>
                    </div>
                  </div>

                  {/* View Products Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewProducts(deal.id)}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    View Products
                    <FaArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FaTag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Deals
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for exciting offers and discounts!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(DealsPage);
