import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FaBars, FaHome, FaTags, FaBox, FaShoppingCart, FaUsers, FaChartLine } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";

const sidebarLinks = [
  { name: "Dashboard", path: "/", icon: FaHome },
  { name: "Manage Deals", path: "/deals/manage", icon: FaTags },
  { name: "Products", path: "/products", icon: FaBox },
  { name: "Orders", path: "/orders", icon: FaShoppingCart },
  { name: "Users", path: "/users", icon: FaUsers },
  { name: "Analytics", path: "/analytics", icon: FaChartLine }
];

const Sidebar = memo(({ sidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const { isDark } = useContext(ThemeContext);

  const menuItems = useMemo(() => 
    sidebarLinks.map(({ name, path, icon: Icon }) => {
      const isActive = location.pathname === path;

      return (
        <motion.div
          key={name}
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="mx-2 mb-1"
        >
          <Link
            to={path}
            className={`relative flex items-center p-4 transition-all duration-300 rounded-xl group overflow-hidden
              ${isActive 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                : `hover:bg-slate-700/20 ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`
              }`}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            {/* Hover effect */}
            <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              isDark 
                ? "bg-gradient-to-r from-slate-700/30 to-slate-600/30" 
                : "bg-gradient-to-r from-slate-200/30 to-slate-100/30"
            }`} />
            
            <div className="relative flex items-center w-full">
              <Icon className={`w-5 h-5 transition-all duration-300 ${
                isActive 
                  ? "text-white" 
                  : isDark 
                    ? "text-slate-400 group-hover:text-slate-200" 
                    : "text-slate-500 group-hover:text-slate-700"
              }`} />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-medium text-sm"
                >
                  {name}
                </motion.span>
              )}
            </div>
          </Link>
        </motion.div>
      );
    }),
    [location.pathname, sidebarOpen, isDark]
  );

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: sidebarOpen ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed inset-y-0 left-0 z-50 backdrop-blur-xl border-r transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/80 border-slate-700/50 shadow-2xl shadow-slate-900/20" 
          : "bg-white/80 border-slate-200/50 shadow-2xl shadow-slate-900/10"
      }`}
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 ${
        isDark
          ? "bg-gradient-to-b from-slate-800/50 via-slate-900/30 to-slate-900/50"
          : "bg-gradient-to-b from-white/50 via-slate-50/30 to-white/50"
      }`} />
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className={`p-4 border-b backdrop-blur-sm ${
          isDark ? "border-slate-700/30" : "border-slate-200/30"
        }`}>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDark 
                  ? "hover:bg-slate-700/30 text-slate-300 hover:text-white" 
                  : "hover:bg-slate-100/50 text-slate-600 hover:text-slate-900"
              }`}
              aria-label="Toggle Sidebar"
            >
              <FaBars className={`h-5 w-5 transition-all duration-300 ${
                sidebarOpen ? "rotate-90" : ""
              }`} />
            </motion.button>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className={`font-semibold text-lg ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  ShopAdmin
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-700/30 scrollbar-track-transparent">
          <div className="px-3 space-y-2">{menuItems}</div>
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t backdrop-blur-sm ${
          isDark ? "border-slate-700/30" : "border-slate-200/30"
        }`}>
          <div className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
            isDark 
              ? "bg-slate-800/30 hover:bg-slate-700/40" 
              : "bg-slate-100/30 hover:bg-slate-200/40"
          }`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold">A</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3 overflow-hidden flex-1"
              >
                <p className={`text-sm font-semibold truncate ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Admin User
                </p>
                <p className={`text-xs truncate ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  admin@example.com
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default Sidebar;