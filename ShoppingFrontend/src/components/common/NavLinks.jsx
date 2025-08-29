import React, { useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaHome, FaPercent, FaTools, FaQuestionCircle, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";

const navItems = [
  { name: "Home", icon: FaHome, path: "/" },
  { name: "Deals", icon: FaPercent, path: "/deals" },
  { name: "Service", icon: FaTools, path: "/service" },
  { name: "FAQ", icon: FaQuestionCircle, path: "/faq" },
  { name: "Contact", icon: FaEnvelope, path: "/contact" }
];

const NavLinks = ({ isMobile, onLinkClick, navigate }) => {
  const { hasRole, user } = useAuth();
  const location = useLocation();
  const { isDark } = useContext(ThemeContext);

  const handleLinkClick = useCallback((e) => {
    onLinkClick?.();
  }, [onLinkClick]);

  const isActive = useCallback((path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={isMobile ? "p-2 space-y-1" : "flex items-center space-x-1"}
    >
      {navItems.map(({ name, icon: Icon, path }) => {
        const active = isActive(path);
        return (
          <motion.div
            key={name}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to={path}
              onClick={handleLinkClick}
              className={`
                ${isMobile ? 'flex items-center space-x-3 w-full p-3' : 'inline-flex items-center space-x-2 px-4 py-2'}
                rounded-xl text-sm font-medium transition-all duration-300
                relative overflow-hidden group
                ${active
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              aria-label={name}
            >
              {/* 3D Effect Background */}
              <div className={`
                absolute inset-0 rounded-xl transition-all duration-300
                ${active
                  ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20'
                  : 'bg-gradient-to-br from-gray-500/5 to-gray-500/5 dark:from-gray-500/10 dark:to-gray-500/10'
                }
                group-hover:from-blue-500/20 group-hover:to-purple-500/20
                dark:group-hover:from-blue-500/30 dark:group-hover:to-purple-500/30
              `} />

              {/* Icon with 3D Effect */}
              <motion.div
                className="relative z-10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className={`
                  ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}
                  ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}
                  transition-colors duration-300
                `} />
              </motion.div>

              {/* Text with 3D Effect */}
              <span className={`
                relative z-10
                ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                transition-colors duration-300
                group-hover:text-blue-600 dark:group-hover:text-blue-400
              `}>
                {name}
              </span>

              {/* Active Indicator */}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-xl border-2 border-blue-500/50 dark:border-blue-400/50"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
      {hasRole("ADMIN") && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/admin/dashboard"
            onClick={handleLinkClick}
            className={`
              ${isMobile ? 'flex items-center space-x-3 w-full p-3' : 'inline-flex items-center space-x-2 px-4 py-2'}
              rounded-xl text-sm font-medium transition-all duration-300
              relative overflow-hidden group
              ${isActive("/admin")
                ? 'text-red-600 bg-red-50 dark:bg-red-900/30 shadow-lg shadow-red-500/20'
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
              }
            `}
            aria-label="Admin"
          >
            {/* Admin Link Background */}
            <div className={`
              absolute inset-0 rounded-xl transition-all duration-300
              ${isActive("/admin")
                ? 'bg-gradient-to-br from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20'
                : 'bg-gradient-to-br from-red-500/5 to-pink-500/5 dark:from-red-500/10 dark:to-pink-500/10'
              }
              group-hover:from-red-500/20 group-hover:to-pink-500/20
              dark:group-hover:from-red-500/30 dark:group-hover:to-pink-500/30
            `} />

            {/* Admin Icon */}
            <motion.div
              className="relative z-10"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FaShieldAlt className={`
                ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}
                ${isActive("/admin") ? 'text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'}
                transition-colors duration-300
              `} />
            </motion.div>

            {/* Admin Text */}
            <span className={`
              relative z-10
              ${isActive("/admin") ? 'text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'}
              transition-colors duration-300
              group-hover:text-red-600 dark:group-hover:text-red-400
            `}>
              Admin
            </span>

            {/* Admin Active Indicator */}
            {isActive("/admin") && (
              <motion.div
                layoutId="adminActiveIndicator"
                className="absolute inset-0 rounded-xl border-2 border-red-500/50 dark:border-red-400/50"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NavLinks;