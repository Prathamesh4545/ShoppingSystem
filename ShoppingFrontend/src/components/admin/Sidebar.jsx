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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mx-2 mb-2"
        >
          <Link
            to={path}
            className={`flex items-center p-4 transition-all duration-300 rounded-xl group
              ${isActive 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : `hover:bg-gray-700/30 ${isDark ? "text-gray-300" : "text-gray-600"}`
              }`}
          >
            <Icon className={`w-6 h-6 transition-colors ${
              isActive 
                ? "text-white" 
                : isDark 
                  ? "text-gray-400 group-hover:text-white" 
                  : "text-gray-500 group-hover:text-gray-900"
            }`} />
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3 font-medium"
              >
                {name}
              </motion.span>
            )}
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
      className={`fixed inset-y-0 left-0 shadow-2xl z-50 ${
        isDark 
          ? "bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-800" 
          : "bg-gradient-to-b from-white to-gray-50 border-r border-gray-200"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200/30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-700/20 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <FaBars className={`h-6 w-6 transition-transform ${
              isDark ? "text-gray-300" : "text-gray-600"
            } ${sidebarOpen ? "rotate-90" : ""}`} />
          </motion.button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700/30 scrollbar-track-transparent">
          <div className="px-2 space-y-1">{menuItems}</div>
        </nav>

        <div className="p-4 border-t border-gray-200/30">
          <div className="flex items-center p-2 rounded-lg bg-gray-800/20">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-medium">A</span>
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-medium text-gray-200 truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">admin@example.com</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default Sidebar;