import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGrid3X3, FaList, FaFilter, FaSort } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../Product/ProductCard';

const ModernProductGrid = ({ 
  products, 
  loading, 
  error, 
  onAddToCart, 
  isAuthenticated,
  activeDeals = []
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const theme = useTheme();
  const { isDark, colors, spacing, borderRadius, shadows } = theme;

  const applyDiscount = (product) => {
    const deal = activeDeals.find(deal =>
      deal.products?.some(p => p.id === product.id)
    );
    if (deal) {
      return product.price * (1 - deal.discountPercentage / 100);
    }
    return product.price;
  };

  const processedProducts = useMemo(() => {
    let filtered = products.map(product => ({
      ...product,
      discountedPrice: applyDiscount(product),
      dealInfo: activeDeals.find(deal =>
        deal.products?.some(p => p.id === product.id)
      )
    }));

    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter(product => {
        switch (filterBy) {
          case 'deals':
            return product.dealInfo;
          case 'new':
            return new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case 'popular':
            return product.rating >= 4;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        return filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
      case 'price_desc':
        return filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
      case 'name':
        return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return filtered;
    }
  }, [products, activeDeals, sortBy, filterBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg"
           style={{ backgroundColor: isDark ? colors.background.dark.secondary : colors.background.light.secondary }}>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <FaGrid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <FaList className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Products</option>
              <option value="deals">On Sale</option>
              <option value="new">New Arrivals</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FaSort className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        <AnimatePresence>
          {processedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
              className={viewMode === 'list' ? 'w-full' : ''}
            >
              <ProductCard
                product={product}
                addToCart={onAddToCart}
                isAuthenticated={isAuthenticated}
                discountedPrice={product.discountedPrice}
                dealInfo={product.dealInfo}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Results Count */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {processedProducts.length} of {products.length} products
      </div>
    </div>
  );
};

export default ModernProductGrid;