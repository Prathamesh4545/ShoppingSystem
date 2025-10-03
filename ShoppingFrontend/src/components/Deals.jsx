import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import ThemeContext from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTag,
  FaClock,
  FaPercent,
  FaGift,
  FaArrowRight,
  FaFire,
  FaArrowLeft,
} from "react-icons/fa";

const DealsPage = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const fetchDeals = useCallback(async () => {
    if (isTokenExpired(token)) {
      logout();
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deals/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
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

  const formatDate = useCallback((dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy");
  }, []);

  const activeDeals = useMemo(() => {
    return deals;
  }, [deals]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchDeals();
  }, [fetchDeals]);

  const handleViewProducts = (dealId) => {
    navigate(`/?dealId=${dealId}`);
  };

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
      className={`pt-16 min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="px-4 md:px-10 lg:px-20 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="mb-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50 animate-pulse"></div>
              <FaFire className="relative text-5xl text-orange-500" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Exclusive Deals
            </h1>
          </motion.div>
          <p className={`text-lg ml-16 max-w-3xl ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Discover amazing discounts and limited-time offers on our products. Don't miss out!
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            <p className="text-red-500">Error: {error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer border-none hover:bg-blue-700"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ClipLoader color="#3B82F6" size={50} />
          </div>
        ) : Array.isArray(activeDeals) && activeDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {activeDeals.map((deal, index) => {
                const timeRemaining = (() => {
                  try {
                    const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);
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
                    return null;
                  }
                })();

                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -12 }}
                    onClick={() => handleViewProducts(deal.id)}
                    className={`group relative cursor-pointer overflow-hidden rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-gray-900/90 via-purple-900/50 to-blue-900/50 border-white/10 hover:border-purple-500/50 shadow-2xl hover:shadow-purple-500/40'
                        : 'bg-white border-gray-200 hover:border-purple-400 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20'
                    }`}
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl"></div>
                    </div>

                    {/* Deal Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-lg opacity-75"></div>
                        <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-2xl flex items-center gap-2">
                          <FaPercent className="text-sm" />
                          <span className="text-lg">{deal.discountPercentage}%</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Deal Image */}
                    <div className="relative h-56 overflow-hidden">
                      <motion.img
                        src={getImageSrc(deal)}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                        isDarkMode ? 'from-black/90 via-black/40 to-transparent' : 'from-black/70 via-black/30 to-transparent'
                      }`} />
                      
                      {/* Floating Timer Badge */}
                      {timeRemaining && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-4 left-4 backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 rounded-xl px-4 py-2 flex items-center gap-2"
                        >
                          <FaClock className="text-orange-400 animate-pulse" />
                          <span className="text-white font-semibold text-sm">Ends in {timeRemaining}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Deal Content */}
                    <div className="relative p-6 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                          {deal.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {deal.description}
                        </p>
                      </div>

                      {/* Deal Stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <FaTag className="text-green-600 dark:text-green-400 text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{deal.products?.length || 0}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          Shop
                          <FaArrowLeft className="rotate-180 text-sm" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <div className={`p-4 mb-4 inline-block rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <FaTag className={`w-12 h-12 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <h3 className={`text-2xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No Active Deals
            </h3>
            <p className={`text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Check back later for exciting offers and discounts!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DealsPage);