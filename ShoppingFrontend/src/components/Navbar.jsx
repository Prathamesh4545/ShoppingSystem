import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { DataContext } from "../context/ProductContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setSearchQuery, setSearchField } = useContext(DataContext);
  const [searchQuery, setSearchQueryState] = useState("");
  const location = useLocation();
  
  const showSearchPaths = ["/"]

  const showSearchBar = showSearchPaths.includes(location.pathname)

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

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 mb-5">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <a href="#" className="flex items-center space-x-3">
            <img
              src="https://img.freepik.com/free-photo/3d-rendering-cartoon-shopping-cart_23-2151680623.jpg?ga=GA1.1.940795691.1737829496&semt=ais_hybrid"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Shopping Site
            </span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={handleMenuToggle}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg md:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-controls="navbar-cta"
            aria-expanded={isMenuOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          {/* Navbar Links */}
          <div
            className={`${
              isMenuOpen ? "block" : "hidden"
            } w-full md:flex md:items-center md:space-x-8 md:w-auto`}
            id="navbar-cta"
          >
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <li>
                <Link
                  to="/"
                  className="text-lg font-medium text-gray-800 hover:text-blue-600 dark:text-white dark:hover:text-yellow-400 transition duration-300"
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-lg font-medium text-gray-800 hover:text-blue-600 dark:text-white dark:hover:text-yellow-400 transition duration-300"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-lg font-medium text-gray-800 hover:text-blue-600 dark:text-white dark:hover:text-yellow-400 transition duration-300"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-lg font-medium text-gray-800 hover:text-blue-600 dark:text-white dark:hover:text-yellow-400 transition duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {
            showSearchBar && (<div className="hidden md:flex space-x-4">
            <select
              id="products"
              onChange={handleSearchFieldChange}
              className="block text-sm text-gray-500 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select a product</option>
              <option value="productName">Name</option>
              <option value="brand">Brand</option>
              <option value="category">Category</option>
            </select>

            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search icon</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                id="search-navbar"
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;