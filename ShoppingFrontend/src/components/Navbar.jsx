import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DataContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { Popover, Modal, Label, TextInput, Button } from "flowbite-react";
import { FaSearch, FaTimes, FaBars, FaShoppingCart, FaUser } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const { setSearchQuery, setSearchField } = useContext(DataContext);
  const { cart } = useCart(); // Use the custom hook to access cart state
  const [searchQuery, setSearchQueryState] = useState("");
  const location = useLocation();

  const showSearchPaths = ["/"];
  const showSearchBar = showSearchPaths.includes(location.pathname);

  const handleInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setSearchQueryState(query);
  };

  const handleSearchFieldChange = (event) => {
    const field = event.target.value;
    setSearchField(field);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLoginModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleLogin = () => {
    // Simulate login logic
    setIsLoggedIn(true);
    setOpenModal(false);
  };

  const handleLogout = () => {
    // Simulate logout logic
    setIsLoggedIn(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="https://img.freepik.com/free-photo/3d-rendering-cartoon-shopping-cart_23-2151680623.jpg?ga=GA1.1.940795691.1737829496&semt=ais_hybrid"
                alt="Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Shopping System
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={handleMenuToggle}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-white focus:outline-none transition duration-300"
              aria-expanded={isMenuOpen ? "true" : "false"}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Navbar Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              Services
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={handleSearchToggle}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
            >
              <FaShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* User Icon */}
            {isLoggedIn ? (
              // If logged in, show profile popover
              <Popover
                trigger="hover"
                content={
                  <div className="text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <div className="space-y-2 p-4">
                      <div className="text-gray-700 dark:text-white">
                        Welcome, User!
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                }
              >
                <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300">
                  <FaUser className="w-5 h-5" />
                </button>
              </Popover>
            ) : (
              // If not logged in, show login modal on click
              <button
                onClick={handleLoginModal}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
              >
                <FaUser className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
              >
                Services
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar Modal */}
        {isSearchOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleSearchToggle}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row justify-stretch items-center">
                <select
                  id="products"
                  onChange={handleSearchFieldChange}
                  className="block text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Search By</option>
                  <option value="productName">Product Name</option>
                  <option value="brand">Brand</option>
                  <option value="category">Category</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="block w-full pl-10 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <Modal show={openModal} size="md" onClose={handleCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Sign in to our platform
            </h3>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput
                id="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Your password" />
              </div>
              <TextInput id="password" type="password" required />
            </div>
            <div className="w-full">
              <Button onClick={handleLogin}>Log in to your account</Button>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?&nbsp;
              <a
                href="#"
                className="text-cyan-700 hover:underline dark:text-cyan-500"
              >
                Create account
              </a>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </nav>
  );
};

export default Navbar;