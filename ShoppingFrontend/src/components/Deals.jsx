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
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTag,
  FaClock,
  FaPercent,
  FaGift,
  FaArrowRight,
} from "react-icons/fa";

const DealsPage = () => {
  const theme = useTheme();
  const { isDark, colors, spacing, typography, borderRadius, shadows, transitions } = theme;
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Parse transition durations to milliseconds for Framer Motion
  const getTransitionDuration = (transitionString) => {
    // If transitions.normal is "250ms ease-in-out", extract just the number
    const match = transitionString.match(/(\d+)ms/);
    return match ? Number(match[1]) / 1000 : 0.3; // Convert to seconds or default to 0.3
  };

  const transitionDurations = {
    fast: getTransitionDuration(transitions.fast) || 0.15,
    normal: getTransitionDuration(transitions.normal) || 0.25,
    slow: getTransitionDuration(transitions.slow) || 0.35
  };

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

  // Determine background and text colors based on theme
  const bgColor = isDark ? colors.background.dark.primary : colors.background.light.primary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
  const textColorSecondary = isDark ? colors.text.dark.secondary : colors.text.light.secondary;
  const textColorTertiary = isDark ? colors.text.dark.tertiary : colors.text.light.tertiary;
  const cardBgColor = isDark ? colors.background.dark.secondary : colors.background.light.secondary;

  return (
    <div
      className="pt-24 px-4 md:px-10 lg:px-20 min-h-screen"
      style={{ 
        paddingTop: spacing['5xl'],
        paddingBottom: spacing['4xl'],
        backgroundColor: bgColor
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: transitionDurations.normal, type: "spring", stiffness: 300 }}
        className="text-center mb-12"
      >
        <h1 
          style={{ 
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.md,
            color: textColor
          }}
        >
          Special Deals & Offers
        </h1>
        <p 
          style={{ 
            fontSize: typography.fontSize.lg,
            color: textColorSecondary,
            maxWidth: "42rem",
            margin: "0 auto"
          }}
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
          transition={{ duration: transitionDurations.normal }}
          className="text-center py-4"
        >
          <p style={{ color: colors.error.DEFAULT }}>Error: {error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: "#FFFFFF",
              marginTop: spacing.sm,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              border: "none"
            }}
          >
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div 
          className="flex justify-center items-center"
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
                transition={{ 
                  delay: index * 0.1,
                  duration: transitionDurations.normal
                }}
                className="group relative overflow-hidden"
                style={{
                  borderRadius: borderRadius.xl,
                  backgroundColor: cardBgColor,
                  boxShadow: shadows.md
                }}
              >
                {/* Deal Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: transitionDurations.normal }}
                  className="absolute top-4 right-4 z-10"
                >
                  <div 
                    style={{
                      background: `linear-gradient(to right, ${colors.error.DEFAULT}, ${colors.error.dark})`,
                      padding: `${spacing.xs} ${spacing.md}`,
                      borderRadius: borderRadius.full,
                      color: "#FFFFFF",
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.xs,
                      boxShadow: shadows.sm
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
                    className="w-full h-full object-cover"
                    style={{
                      transform: "scale(1)",
                      transition: `transform ${transitionDurations.slow}s ease-in-out`
                    }}
                    wrapperClassName="group-hover:scale-110"
                    placeholderSrc="https://placehold.co/600x400?text=Loading..."
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100" 
                    style={{
                      transition: `opacity ${transitionDurations.normal}s ease-in-out`
                    }}
                  />
                </div>

                {/* Deal Content */}
                <div style={{ padding: spacing.lg }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold,
                      marginBottom: spacing.md,
                      color: textColor
                    }}
                  >
                    {deal.title}
                  </h3>
                  <p
                    style={{ 
                      marginBottom: spacing.md, 
                      color: textColorSecondary,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {deal.description}
                  </p>

                  {/* Deal Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, fontSize: typography.fontSize.sm }}>
                      <FaClock style={{ color: colors.primary.light }} />
                      <span style={{ color: textColorTertiary }}>
                        Valid from {formatDate(deal.startDate)} to {formatDate(deal.endDate)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, fontSize: typography.fontSize.sm }}>
                      <FaGift style={{ color: colors.success.light }} />
                      <span style={{ color: textColorTertiary }}>
                        {deal.products?.length || 0} Products
                      </span>
                    </div>
                  </div>

                  {/* View Products Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: transitionDurations.fast }}
                    onClick={() => handleViewProducts(deal.id)}
                    style={{
                      marginTop: spacing.lg,
                      background: `linear-gradient(to right, ${colors.primary.DEFAULT}, ${colors.secondary.DEFAULT})`,
                      color: "#FFFFFF",
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.lg,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: spacing.sm,
                      boxShadow: shadows.sm,
                      fontWeight: typography.fontWeight.medium,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    View Products
                    <FaArrowRight style={{ width: "1rem", height: "1rem" }} />
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
          transition={{ duration: transitionDurations.normal }}
          className="text-center py-12"
        >
          <div 
            style={{
              padding: spacing.md,
              backgroundColor: isDark ? colors.background.dark.tertiary : colors.background.light.tertiary,
              marginBottom: spacing.md,
              display: "inline-block",
              borderRadius: "50%"
            }}
          >
            <FaTag style={{ 
              width: "3rem", 
              height: "3rem", 
              color: textColorTertiary 
            }} />
          </div>
          <h3 
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: textColor
            }}
          >
            No Active Deals
          </h3>
          <p 
            style={{ 
              fontSize: typography.fontSize.base,
              color: textColorSecondary
            }}
          >
            Check back later for exciting offers and discounts!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(DealsPage);