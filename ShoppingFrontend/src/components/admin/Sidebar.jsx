import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FaBars } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const sidebarLinks = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Manage Deals", path: "/deals/manage", icon: "🔝" },
  { name: "Products", path: "/products", icon: "📦" },
  { name: "Add Product", path: "/products/add", icon: "✚" },
  { name: "Orders", path: "/orders", icon: "🛒" },
  { name: "Users", path: "/users", icon: "👥" },
];

const Sidebar = memo(({ sidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const { isDark } = useContext(ThemeContext);
  const menuItems = useMemo(
    () =>
      sidebarLinks.map(({ name, path, icon }) => {
        const isActive = location.pathname === path;

        return (
          <Link
            key={name}
            to={path}
            className={`flex items-center p-4 transition-all duration-300 rounded-md mx-2
              ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}
            `}
          >
            <span className="text-lg">{icon}</span>
            <span
              className={`ml-3 transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!sidebarOpen}
            >
              {name}
            </span>
          </Link>
        );
      }),
    [location.pathname, sidebarOpen]
  );

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: sidebarOpen ? 240 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed inset-y-0 left-0 shadow-lg overflow-hidden ${
        isDark ? "bg-gray-900" : "bg-gray-800"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="p-3 flex items-center justify-center w-full hover:bg-gray-700"
        aria-label="Toggle Sidebar"
      >
        <FaBars className="h-6 w-6" />
      </button>
      <nav className="mt-4">{menuItems}</nav>
    </motion.div>
  );
});

export default Sidebar;
