import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const SearchBar = ({ onSearch, onFilter, suggestions = [], placeholder = "Search products..." }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'newest'
  });
  
  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;
  const searchRef = useRef(null);

  const bgColor = isDark ? colors.background.dark.secondary : colors.background.light.primary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery = query) => {
    onSearch?.(searchQuery, filters);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div 
        className="flex items-center rounded-full border-2 transition-all duration-300"
        style={{
          backgroundColor: bgColor,
          borderColor: showSuggestions || showFilters ? colors.primary.DEFAULT : 'transparent',
          boxShadow: shadows.lg
        }}
      >
        <div className="flex-1 flex items-center px-4 py-3">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            style={{ color: textColor }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                handleSearch('');
              }}
              className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <FaTimes className="text-gray-400" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-full"
        >
          <FaFilter className="text-gray-400" />
        </button>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-lg border overflow-hidden z-50"
            style={{ backgroundColor: bgColor, boxShadow: shadows.lg }}
          >
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ color: textColor }}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-lg border"
            style={{ backgroundColor: bgColor, boxShadow: shadows.lg }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 rounded-lg border bg-transparent"
                style={{ color: textColor }}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="px-3 py-2 rounded-lg border bg-transparent"
                style={{ color: textColor }}
              >
                <option value="">Any Price</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 rounded-lg border bg-transparent"
                style={{ color: textColor }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;