import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = ["Home", "Deals", "Service", "FAQ", "Contact"];

const NavLinks = React.memo(({ isMobile, onLinkClick, navigate }) => {
  const { hasRole } = useAuth();
  const location = useLocation();

  const handleLinkClick = (path) => {
    if (onLinkClick) {
      onLinkClick();
    }
    navigate(path);
  };

  return (
    <>
      {navItems.map((item) => {
        const path = `/${item === "Home" ? "" : item.toLowerCase()}`;
        const isActive = path === "/" ? location.pathname === path : location.pathname.startsWith(path);

        return (
          <Link
            key={item}
            to={path}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(path);
            }}
            className={`text-sm font-medium ${
              isMobile
                ? "block p-3 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
                : "px-4 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            } ${isActive ? "text-blue-600 dark:text-white font-semibold" : ""}`}
            aria-label={item}
          >
            {item}
          </Link>
        );
      })}
      {hasRole("ADMIN") && (
        <Link
          to="/admin"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick("/admin/dashboard");
          }}
          className={`text-sm font-medium ${
            isMobile
              ? "block p-3 text-red-600 hover:text-red-700"
              : "px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition duration-300"
          }`}
          aria-label="Admin"
        >
          Admin
        </Link>
      )}
    </>
  );
});

export default NavLinks;