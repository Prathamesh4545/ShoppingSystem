import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  useContext,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import ThemeContext from "../../context/ThemeContext";
import {
  FaSearch,
  FaTimes,
  FaBars,
  FaShoppingCart,
  FaUser,
  FaMoon,
  FaSun,
  FaSignOutAlt,
} from "react-icons/fa";
import LoginForm from "../forms/LoginForm";
import RegistrationForm from "../forms/RegistrationForm";
import NavLinks from "./NavLinks";
import LoadingSpinner from "../common/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const UserProfileDropdown = memo(
  ({ isAuthenticated, user, logout, setModalType }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dropdownRef = useRef(null);
    const { isDarkMode } = useContext(ThemeContext);
    const { user: userData, loading } = useUser();

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageError = (e) => {
      console.error("Image load error - sanitized");
      e.target.src = "https://placehold.co/150";
    };

    const getImageSource = (userData) => {
      if (!userData) return "https://placehold.co/150";
      if (userData.imageData && userData.imageType) {
        return `data:${userData.imageType};base64,${userData.imageData}`;
      }
      return "https://placehold.co/150";
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            dark:focus:ring-offset-gray-900 rounded-full relative"
          aria-label="User Profile"
        >
          {isAuthenticated ? (
            <div className="relative">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : (
                <>
                  <img
                    src={getImageSource(userData || user)}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 
                      hover:ring-blue-500/40 transition-all duration-300"
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isHovered ? 1.2 : 1 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 
                    rounded-full border-2 border-white dark:border-gray-900"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaUser className="w-5 h-5" />
              </motion.div>
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 
                rounded-full border-2 border-white dark:border-gray-900"
              />
            </div>
          )}
        </motion.button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 
                backdrop-blur-xl rounded-xl shadow-2xl z-50 border border-gray-100/50 
                dark:border-gray-700/50 overflow-hidden"
            >
              {isAuthenticated ? (
                <>
                  {/* User Info Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="px-4 py-3 border-b border-gray-100/50 dark:border-gray-700/50 
                    bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 
                    dark:to-purple-900/20"
                  >
                    <div className="flex items-center space-x-3">
                      {loading ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      ) : (
                        <motion.img
                          src={getImageSource(userData || user)}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                          onError={handleImageError}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        />
                      )}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userData?.firstName || user?.firstName || "User"} {userData?.lastName || user?.lastName || ""}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {userData?.email || user?.email || ""}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Menu Items */}
                  <motion.div
                    className="py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200
                        group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center"
                      >
                        <FaUser
                          className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 
                          transition-colors duration-200"
                        />
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Profile
                        </span>
                      </motion.div>
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200
                        group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center"
                      >
                        <FaShoppingCart
                          className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 
                          transition-colors duration-200"
                        />
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Orders
                        </span>
                      </motion.div>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200
                        group"
                    >
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center"
                      >
                        <FaSignOutAlt
                          className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500 
                          transition-colors duration-200"
                        />
                        <span className="group-hover:text-red-600 dark:group-hover:text-red-400">
                          Logout
                        </span>
                      </motion.div>
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="px-4 py-3 border-b border-gray-100/50 dark:border-gray-700/50 
                    bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 
                    dark:to-purple-900/20"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Welcome to Shopping System
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Please login or register to continue
                    </p>
                  </motion.div>

                  {/* Auth Buttons */}
                  <motion.div
                    className="p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setModalType("login");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white 
                        bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg
                        hover:from-blue-700 hover:to-blue-800 transition-all duration-300
                        shadow-md hover:shadow-lg hover:shadow-blue-500/25
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        dark:focus:ring-offset-gray-900"
                    >
                      Login
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setModalType("register");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full mt-2 px-4 py-2.5 text-sm font-medium text-blue-600 
                        bg-blue-50 dark:bg-blue-900/20 rounded-lg
                        hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300
                        border border-blue-200 dark:border-blue-800
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        dark:focus:ring-offset-gray-900"
                    >
                      Register
                    </motion.button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

const SearchBar = memo(
  ({ isOpen, onClose, inputValue, onChange, onClear, onSubmit, inputRef }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div
        className={`
        fixed inset-x-0 top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border-b border-gray-100/50 dark:border-gray-800/50
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform z-50
        ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }
      `}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <form
              onSubmit={onSubmit}
              className="relative flex-1 max-w-2xl mx-auto"
            >
              <div className="relative group">
                {/* Animated gradient background */}
                <motion.div
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: isFocused ? 0.3 : 0.2 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 
                  rounded-2xl opacity-20 group-hover:opacity-30 blur-xl dark:opacity-30 dark:group-hover:opacity-40"
                />

                <div className="relative">
                  {/* Search icon with pulse animation */}
                  <div
                    className="absolute left-3.5 top-1/2 transform -translate-y-1/2 group-hover:scale-110 
                  transition-transform duration-300"
                  >
                    <div className="relative">
                      <FaSearch className="w-4 h-4 text-blue-500 dark:text-blue-400 transition-colors duration-300" />
                      <div className="absolute inset-0 animate-ping-slow opacity-30 text-blue-500">
                        <FaSearch className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Search Input */}
                  <motion.input
                    ref={inputRef}
                    type="search"
                    value={inputValue}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search products..."
                    className="w-full pl-11 pr-20 py-3.5 rounded-xl
                    bg-white/70 dark:bg-gray-800/70
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                    focus:bg-white dark:focus:bg-gray-800 dark:focus:ring-offset-gray-900
                    text-gray-900 dark:text-white
                    border border-gray-200/50 dark:border-gray-700/50
                    text-base transition-all duration-300
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    group-hover:border-blue-500/50 group-hover:shadow-lg
                    group-hover:shadow-blue-500/10
                    group-hover:scale-[1.01]"
                    animate={{
                      borderColor: isFocused
                        ? "rgba(59, 130, 246, 0.5)"
                        : "rgba(229, 231, 235, 0.5)",
                      boxShadow: isFocused
                        ? "0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)"
                        : "none",
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Action Buttons */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1.5">
                    {inputValue && (
                      <motion.button
                        type="button"
                        onClick={onClear}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 
                        dark:hover:text-gray-300 transition-all duration-200 
                        hover:bg-gray-100 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTimes className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700
                      text-white transition-all duration-300 
                      hover:from-blue-700 hover:to-blue-800
                      hover:shadow-md hover:shadow-blue-500/25
                      flex items-center space-x-1.5
                      border border-blue-600/20"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="hidden sm:inline text-sm font-medium">
                        Search
                      </span>
                      <FaSearch className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 
              dark:hover:text-gray-300 transition-all duration-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-gray-400/50"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search Suggestions */}
          {inputValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 
              rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 
              backdrop-blur-lg overflow-hidden"
            >
              <div
                className="p-3 border-b border-gray-100/50 dark:border-gray-700/50
              flex items-center justify-between"
              >
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recent Searches
                </h3>
                <button
                  className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400
                transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
              <div className="p-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 
                transition-all duration-200 cursor-pointer"
                >
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center space-x-2">
                    <FaSearch className="w-3 h-3 text-gray-400" />
                    <span>Start typing to see suggestions...</span>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);

const NavButton = memo(({ children, onClick, className, ...props }) => (
  <motion.button
    onClick={onClick}
    className={`p-2.5 rounded-full transition-all duration-200 relative 
      hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
      dark:focus:ring-offset-gray-900 ${className}`}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
));

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when search bar is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const clearSearch = () => {
    setInputValue("");
  };

  const cartItemCount = useMemo(() => cart?.length || 0, [cart]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed w-full z-40 transition-all duration-500 ${
        isScrolled
          ? "backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 shadow-2xl border-b border-white/20 dark:border-gray-700/30 py-2"
          : "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 shadow-lg py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/"
              className="flex items-center space-x-3 group focus:outline-none 
                focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
            >
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src="https://img.freepik.com/free-photo/3d-rendering-cartoon-shopping-cart_23-2151680623.jpg"
                    alt="Logo"
                    className="h-10 w-10 rounded-full object-cover transition-transform duration-300 
                      group-hover:scale-110 group-hover:shadow-lg"
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ opacity: 0.8 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                  transition-opacity duration-300"
                />
              </div>
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 
                transition-all duration-300"
              >
                Shopping System
              </motion.span>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks
              isMobile={false}
              onLinkClick={() => setIsMenuOpen(false)}
              navigate={navigate}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar Component */}
            <SearchBar
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              inputValue={inputValue}
              onChange={handleInputChange}
              onClear={clearSearch}
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/search");
              }}
              inputRef={searchInputRef}
            />

            {/* Search Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isSearchOpen
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              aria-label="Toggle Search"
            >
              <FaSearch className="w-5 h-5" />
            </motion.button>

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to="/cart"
                className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white 
                  transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  dark:focus:ring-offset-gray-900 relative block"
                aria-label="Cart"
              >
                <FaShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm flex items-center justify-center min-w-[18px] h-[18px]"
                  >
                    {Math.min(cartItemCount, 99)}
                    {cartItemCount > 99 && "+"}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-white 
                transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                dark:focus:ring-offset-gray-900"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaSun className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaMoon className="w-5 h-5" />
                </motion.div>
              )}
            </motion.button>

            {/* User Profile */}
            <UserProfileDropdown
              isAuthenticated={isAuthenticated}
              user={user}
              logout={logout}
              setModalType={setModalType}
            />

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-gray-500 hover:text-blue-600 dark:hover:text-white 
                transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                dark:focus:ring-offset-gray-900"
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 90 }}
                    exit={{ rotate: 0 }}
                  >
                    <FaTimes className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                  >
                    <FaBars className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden overflow-hidden"
            >
              <div
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-t 
                border-gray-100/50 dark:border-gray-800/50 py-2"
              >
                <NavLinks
                  isMobile={true}
                  onLinkClick={() => setIsMenuOpen(false)}
                  navigate={navigate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType === "login" && (
          <LoginForm
            showLoginModal={true}
            onClose={() => setModalType(null)}
            onSwitchToRegister={() => setModalType("register")}
          />
        )}
        {modalType === "register" && (
          <RegistrationForm
            showRegistrationModal={true}
            onClose={() => setModalType(null)}
            onSwitchToLogin={() => setModalType("login")}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default memo(Navbar);
