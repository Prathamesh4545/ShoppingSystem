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
import { DataContext } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import {
  FaSearch,
  FaTimes,
  FaBars,
  FaShoppingCart,
  FaUser,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { debounce } from "lodash";
import LoginForm from "../forms/LoginForm";
import RegistrationForm from "../forms/RegistrationForm";
import NavLinks from "./NavLinks";
import LoadingSpinner from "../common/LoadingSpinner";

const UserProfileDropdown = memo(
  ({ isAuthenticated, user, logout, setModalType }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white transition"
          aria-label="User Profile"
        >
          {isAuthenticated ? (
            <img
              src={user?.profilePicture || "https://via.placeholder.com/150"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <FaUser className="w-5 h-5" />
          )}
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </Link>
                <Link
                  to="/my-orders"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setModalType("login");
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [modalType, setModalType] = useState(null);
  const { setSearchQuery, setSearchField } = useContext(DataContext);
  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  // Focus search input when search bar is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setSearchField("productName");
    }, 300),
    [setSearchQuery, setSearchField]
  );

  useEffect(() => {
    return () => handleSearch.cancel();
  }, [handleSearch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
  };

  const cartItemCount = useMemo(() => cart?.length || 0, [cart]);

  return (
    <nav className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-md shadow-lg fixed w-full z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://img.freepik.com/free-photo/3d-rendering-cartoon-shopping-cart_23-2151680623.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover"
              loading="lazy"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Shopping System
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavLinks
              isMobile={false}
              onLinkClick={() => setIsMenuOpen(false)}
              navigate={navigate}
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white transition"
              aria-label="Toggle Search"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            <div
              className={`fixed md:static top-0 right-0 w-full md:w-auto bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent p-4 md:p-0 transform ${
                isSearchOpen ? "translate-x-0" : "translate-x-full"
              } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
            >
              <div
                className={`flex items-center border ${
                  isSearchFocused
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-full transition-all duration-300`}
              >
                <input
                  type="text"
                  ref={searchInputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full p-2 pl-4 text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none rounded-full"
                  placeholder="Search products..."
                  aria-label="Search products"
                />
                {inputValue && (
                  <button
                    onClick={clearSearch}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => navigate("/search")}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white"
                  aria-label="Search"
                >
                  <FaSearch className="w-5 h-5" />
                </button>
              </div>
            </div>

            <Link
              to="/cart"
              className="relative p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white transition"
              aria-label="Cart"
            >
              <FaShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {Math.min(cartItemCount, 99)}
                  {cartItemCount > 99 && "+"}
                </span>
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white transition"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <FaSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </button>

            <UserProfileDropdown
              isAuthenticated={isAuthenticated}
              user={user}
              logout={logout}
              setModalType={setModalType}
            />

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
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-blue-600 dark:hover:text-white transition"
            aria-label="Toggle Menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
            <NavLinks
              isMobile={true}
              onLinkClick={() => setIsMenuOpen(false)}
              navigate={navigate}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default memo(Navbar);