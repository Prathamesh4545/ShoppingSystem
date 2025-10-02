import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

const Layout = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Orders', href: '/orders' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-background-dark-primary' : 'bg-background-light-primary'}`}>
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? isDark
              ? 'bg-background-dark-secondary/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
              : 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src="/logo.png" alt="ShopEase" className="h-8 w-8 drop-shadow-lg" />
              </motion.div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-primary transition-all duration-300`}>
                ShopEase
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-all duration-300 relative group ${
                    isActive(item.href)
                      ? isDark
                        ? 'text-primary-light'
                        : 'text-primary-dark'
                      : isDark
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 group-hover:w-full ${
                    isActive(item.href) ? 'w-full' : ''
                  }`} />
                  <motion.span
                    className="absolute -inset-2 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={isActive(item.href) ? { opacity: 1 } : { opacity: 0 }}
                  />
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FaSearch className="w-5 h-5" />
                </motion.button>
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`absolute right-0 mt-2 w-64 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.2)] ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}
                    >
                      <form onSubmit={handleSearch} className="p-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className={`w-full px-3 py-2 rounded-md text-sm shadow-inner ${
                            isDark
                              ? 'bg-gray-700 text-white placeholder-gray-400'
                              : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              </motion.button>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative p-2 rounded-full transition-all duration-200 group ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaShoppingCart className="w-5 h-5" />
                </motion.div>
                {cartItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary-dark text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 ${
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FaUser className="w-5 h-5" />
                    <span className="hidden md:inline">{user.username}</span>
                  </motion.button>
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.2)] py-1 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    } hidden group-hover:block`}
                  >
                    <Link
                      to="/profile"
                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                >
                  Sign in
                </Link>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`md:hidden shadow-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? isDark
                          ? 'text-primary-light bg-gray-700'
                          : 'text-primary-dark bg-gray-100'
                        : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className={`mt-auto py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} shadow-inner`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src="/logo.png" alt="ShopEase" className="h-8 w-8 drop-shadow-lg" />
                </motion.div>
                <span className={`text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-primary transition-all duration-300`}>
                  ShopEase
                </span>
              </Link>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Your trusted destination for quality products and exceptional service.
              </p>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`text-sm transition-all duration-200 hover:translate-x-1 inline-block ${
                        isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Customer Service
              </h3>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="hover:translate-x-1 transition-transform duration-200">Email: support@shopease.com</li>
                <li className="hover:translate-x-1 transition-transform duration-200">Phone: (555) 123-4567</li>
                <li className="hover:translate-x-1 transition-transform duration-200">Address: 123 Shop Street, City, Country</li>
                <li className="hover:translate-x-1 transition-transform duration-200">FAQs</li>
                <li className="hover:translate-x-1 transition-transform duration-200">Shipping Policy</li>
                <li className="hover:translate-x-1 transition-transform duration-200">Returns & Exchanges</li>
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Newsletter
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Subscribe to our newsletter for updates and exclusive offers.
              </p>
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`flex-1 px-3 py-2 rounded-md text-sm shadow-inner ${
                    isDark
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-md hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                © {new Date().getFullYear()} ShopEase. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className={`text-sm transition-all duration-200 hover:translate-x-1 inline-block ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                  Privacy Policy
                </a>
                <a href="#" className={`text-sm transition-all duration-200 hover:translate-x-1 inline-block ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 