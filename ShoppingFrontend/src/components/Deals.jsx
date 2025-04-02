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
  const { isDarkMode, colors, spacing, typography } = useContext(ThemeContext);
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
      const response = await fetch("http://localhost:8080/api/deals/active", {
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
      className={`pt-24 px-4 md:px-10 lg:px-20 ${
        isDarkMode ? colors.background.dark.primary : colors.background.light.primary
      } min-h-screen`}
      style={{ paddingTop: spacing['4xl'] }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center mb-12"
        style={{ marginBottom: spacing['2xl'] }}
      >
        <h1 
          className={`text-4xl font-bold ${
            isDarkMode ? colors.text.dark.primary : colors.text.light.primary
          } mb-4`}
          style={{ 
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.md 
          }}
        >
          Special Deals & Offers
        </h1>
        <p 
          className={`${
            isDarkMode ? colors.text.dark.secondary : colors.text.light.secondary
          } max-w-2xl mx-auto`}
          style={{ fontSize: typography.fontSize.lg }}
        >
          Discover amazing discounts and limited-time offers on our products.
          Don't miss out on these exclusive deals!
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
          style={{ color: colors.error.DEFAULT }}
        >
          <p>Error: {error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className={`mt-2 px-4 py-2 rounded-md transition duration-200`}
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.light.primary,
              marginTop: spacing.sm,
              padding: `${spacing.sm} ${spacing.md}`,
            }}
          >
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div 
          className="flex justify-center items-center py-12"
          style={{ padding: `${spacing['2xl']} 0` }}
        >
          <ClipLoader color={colors.primary.DEFAULT} size={50} />
        </div>
      ) : Array.isArray(activeDeals) && activeDeals.length > 0 ? (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          style={{ gap: spacing.lg }}
        >
          <AnimatePresence>
            {activeDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl shadow-lg backdrop-blur-lg transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
                }`}
                style={{
                  borderRadius: spacing.xl,
                }}
              >
                {/* Deal Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <div 
                    className="text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${colors.error.DEFAULT}, ${colors.error.dark})`,
                      padding: `${spacing.sm} ${spacing.md}`,
                    }}
                  >
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
                <div className="p-6" style={{ padding: spacing.lg }}>
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      isDarkMode ? colors.text.dark.primary : colors.text.light.primary
                    }`}
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold,
                      marginBottom: spacing.md
                    }}
                  >
                    {deal.title}
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? colors.text.dark.secondary : colors.text.light.secondary
                    } mb-4 line-clamp-2`}
                    style={{ marginBottom: spacing.md }}
                  >
                    {deal.description}
                  </p>

                  {/* Deal Info */}
                  <div className="space-y-3" style={{ gap: spacing.md }}>
                    <div className="flex items-center gap-2 text-sm">
                      <FaClock style={{ color: colors.primary.light }} />
                      <span style={{ color: isDarkMode ? colors.text.dark.tertiary : colors.text.light.tertiary }}>
                        Valid from {formatDate(deal.startDate)} to {formatDate(deal.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaGift style={{ color: colors.success.light }} />
                      <span style={{ color: isDarkMode ? colors.text.dark.tertiary : colors.text.light.tertiary }}>
                        {deal.products?.length || 0} Products
                      </span>
                    </div>
                  </div>

                  {/* View Products Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewProducts(deal.id)}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                    style={{
                      marginTop: spacing.lg,
                      background: `linear-gradient(to right, ${colors.primary.DEFAULT}, ${colors.secondary.DEFAULT})`,
                      color: colors.text.light.primary,
                      padding: `${spacing.sm} ${spacing.md}`,
                    }}
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
          style={{ padding: `${spacing['2xl']} 0` }}
        >
          <div 
            className="inline-block p-4 rounded-full mb-4"
            style={{
              padding: spacing.md,
              backgroundColor: isDarkMode ? colors.background.dark.tertiary : colors.background.light.tertiary,
              marginBottom: spacing.md
            }}
          >
            <FaTag className="w-12 h-12" style={{ color: isDarkMode ? colors.text.dark.tertiary : colors.text.light.tertiary }} />
          </div>
          <h3 
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? colors.text.dark.primary : colors.text.light.primary
            }`}
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm
            }}
          >
            No Active Deals
          </h3>
          <p 
            className={isDarkMode ? colors.text.dark.secondary : colors.text.light.secondary}
            style={{ fontSize: typography.fontSize.base }}
          >
            Check back later for exciting offers and discounts!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(DealsPage);