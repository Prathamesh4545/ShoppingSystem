import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { FaUsers, FaShoppingCart, FaRupeeSign, FaBox, FaChartLine } from 'react-icons/fa';
import { DataContext } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { token } = useAuth();
  const { products, getAllProducts } = useContext(DataContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchAnalyticsData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch products first if not already loaded
      if (!products || products.length === 0) {
        await getAllProducts();
      }

      // Then fetch analytics data
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();

      // Enhance top products with full product details
      if (data.topProducts) {
        data.topProducts = data.topProducts.map(topProduct => {
          const fullProduct = products.find(p => p.id === topProduct.productId);
          return {
            ...topProduct,
            name: fullProduct?.productName || 'Product Not Found',
            category: fullProduct?.category || 'N/A',
            image: fullProduct?.images?.[0]?.imageData || null
          };
        });
      }

      // Enhance category data with product counts
      if (data.categoryData) {
        const categoryCount = products.reduce((acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {});

        data.categoryData = {
          labels: Object.keys(categoryCount),
          values: Object.values(categoryCount)
        };
      }

      setAnalyticsData(data);
      setIsInitialLoad(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, getAllProducts, products]);

  useEffect(() => {
    if (isInitialLoad) {
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData, isInitialLoad]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0';
    try {
      return `₹${value.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })}`;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₹0';
    }
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    try {
      return value.toLocaleString('en-IN');
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = analyticsData?.stats || {};
  const salesData = analyticsData?.salesData || { labels: [], values: [] };
  const categoryData = analyticsData?.categoryData || { labels: [], values: [] };
  const topProducts = analyticsData?.topProducts || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen relative overflow-hidden ${
        isDarkMode 
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" 
          : "bg-gradient-to-br from-sky-50 via-white to-purple-50"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDarkMode ? "bg-purple-500" : "bg-sky-400"
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDarkMode ? "bg-sky-500" : "bg-purple-400"
        }`} />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className={`p-4 rounded-2xl backdrop-blur-md border shadow-2xl ${
              isDarkMode 
                ? "bg-white/10 border-white/20 shadow-purple-500/20" 
                : "bg-white/70 border-white/50 shadow-sky-500/20"
            }`}>
              <FaChartLine className={`w-8 h-8 ${
                isDarkMode ? "text-sky-400" : "text-sky-600"
              }`} />
            </div>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode 
                  ? "from-sky-400 via-purple-400 to-sky-400" 
                  : "from-sky-600 via-purple-600 to-sky-600"
              }`}>
                Analytics Dashboard
              </h1>
              <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                Comprehensive business insights and metrics
              </p>
            </div>
          </motion.div>
      
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Users"
              value={formatNumber(stats.totalUsers)}
              growth={stats.userGrowth}
              icon={<FaUsers className={isDarkMode ? "text-sky-400" : "text-sky-600"} />}
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Total Orders"
              value={formatNumber(stats.totalOrders)}
              growth={stats.orderGrowth}
              icon={<FaShoppingCart className={isDarkMode ? "text-green-400" : "text-green-600"} />}
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              growth={stats.revenueGrowth}
              icon={<FaRupeeSign className={isDarkMode ? "text-yellow-400" : "text-yellow-600"} />}
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Total Products"
              value={formatNumber(products.length)}
              growth={stats.productGrowth}
              icon={<FaBox className={isDarkMode ? "text-purple-400" : "text-purple-600"} />}
              isDarkMode={isDarkMode}
            />
          </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Sales Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.labels.map((label, index) => ({
                month: label,
                amount: salesData.values[index] || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Category Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.labels.map((label, index) => ({
                    name: label,
                    value: categoryData.values[index] || 0
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.labels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={`data:image/jpeg;base64,${product.image}`}
                          alt={product.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <span className="text-gray-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{formatNumber(product.sales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, growth, icon, isDarkMode }) => {
  const isPositive = growth > 0;
  const isNegative = growth < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-300 ${
        isDarkMode 
          ? "bg-white/5 border-white/10 shadow-purple-500/10 hover:bg-white/10" 
          : "bg-white/70 border-white/50 shadow-sky-500/10 hover:bg-white/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${
            isDarkMode ? "text-slate-200" : "text-slate-800"
          }`}>{value}</h3>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {growth !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${
            isPositive 
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : isNegative 
                ? isDarkMode ? 'text-red-400' : 'text-red-600'
                : isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {isPositive ? '↗' : isNegative ? '↘' : '→'} {Math.abs(growth)}%
          </span>
          <span className={`text-sm ml-1 ${
            isDarkMode ? "text-slate-500" : "text-slate-500"
          }`}>vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics; 