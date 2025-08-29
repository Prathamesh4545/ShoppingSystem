import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTimes, FaCheck } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const AdvancedFilters = ({ onFiltersChange, categories = [], brands = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 10000 },
    rating: 0,
    inStock: false,
    onSale: false
  });

  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;

  const handleFilterChange = (type, value) => {
    let newFilters = { ...filters };
    
    switch (type) {
      case 'category':
        if (newFilters.categories.includes(value)) {
          newFilters.categories = newFilters.categories.filter(c => c !== value);
        } else {
          newFilters.categories.push(value);
        }
        break;
      case 'brand':
        if (newFilters.brands.includes(value)) {
          newFilters.brands = newFilters.brands.filter(b => b !== value);
        } else {
          newFilters.brands.push(value);
        }
        break;
      case 'priceRange':
        newFilters.priceRange = value;
        break;
      case 'rating':
        newFilters.rating = value;
        break;
      case 'inStock':
        newFilters.inStock = !newFilters.inStock;
        break;
      case 'onSale':
        newFilters.onSale = !newFilters.onSale;
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 10000 },
      rating: 0,
      inStock: false,
      onSale: false
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.brands.length + 
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors"
        style={{
          backgroundColor: isDark ? colors.background.dark.secondary : colors.background.light.primary,
          borderColor: isDark ? colors.text.dark.tertiary : colors.text.light.tertiary
        }}
      >
        <FaFilter className="w-4 h-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 rounded-lg border z-50"
            style={{
              backgroundColor: isDark ? colors.background.dark.secondary : colors.background.light.primary,
              boxShadow: shadows.xl
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleFilterChange('category', category)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Brands</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleFilterChange('brand', brand)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        max: parseInt(e.target.value) || 10000
                      })}
                      className="w-20 px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      max: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium mb-3">Minimum Rating</h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating)}
                      className={`px-3 py-1 text-sm rounded ${
                        filters.rating >= rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h4 className="font-medium mb-3">Additional</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={() => handleFilterChange('inStock')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={() => handleFilterChange('onSale')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;