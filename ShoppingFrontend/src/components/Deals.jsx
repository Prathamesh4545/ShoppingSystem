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

  const isDealActive = useCallback((deal) => {
    const now = new Date();
    const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
    const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);

    return isAfter(now, startDateTime) && isBefore(now, endDateTime);
  }, []);

  const activeDeals = useMemo(() => {
    return deals.filter((deal) => isDealActive(deal));
  }, [deals, isDealActive]);

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
          className="text-center mb-12"
        >
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
            isDarkMode 
              ? "from-sky-400 via-purple-400 to-sky-400" 
              : "from-sky-600 via-purple-600 to-sky-600"
          }`}>
            Special Deals & Offers
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Discover amazing discounts and limited-time offers on our products.
            Don't miss out on these exclusive deals!
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {activeDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.3,
                  }}
                  className={`group relative overflow-hidden rounded-xl shadow-lg backdrop-blur-lg ${
                    isDarkMode
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/70 border border-white/30"
                  } hover:shadow-xl transition-all duration-300`}
                >
                  {/* Deal Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 rounded-full text-white text-sm font-semibold flex items-center gap-1 shadow-sm">
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
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500 ease-in-out"
                      placeholderSrc="https://placehold.co/600x400?text=Loading..."
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
                  </div>

                  {/* Deal Content */}
                  <div className="p-6">
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {deal.title}
                    </h3>
                    <p
                      className={`mb-4 line-clamp-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {deal.description}
                    </p>

                    {/* Deal Info */}
                    <div className="flex flex-col gap-2">
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <FaClock className="text-blue-500" />
                        <span>
                          Valid from {formatDate(deal.startDate)} to {formatDate(deal.endDate)}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <FaGift className="text-green-500" />
                        <span>
                          {Array.isArray(deal.products) ? deal.products.length : 0} Products
                        </span>
                      </div>
                    </div>

                    {/* View Products Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => handleViewProducts(deal.id)}
                      className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm font-medium border-none cursor-pointer hover:from-blue-700 hover:to-purple-700"
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