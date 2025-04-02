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
import { FaUsers, FaShoppingCart, FaRupeeSign, FaBox } from 'react-icons/fa';
import { DataContext } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
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
      const response = await fetch('http://localhost:8080/api/analytics', {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          growth={stats.userGrowth}
          icon={<FaUsers className="text-blue-500" />}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          growth={stats.orderGrowth}
          icon={<FaShoppingCart className="text-green-500" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={<FaRupeeSign className="text-yellow-500" />}
        />
        <StatCard
          title="Total Products"
          value={formatNumber(products.length)}
          growth={stats.productGrowth}
          icon={<FaBox className="text-purple-500" />}
        />
      </div>

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
  );
};

const StatCard = ({ title, value, growth, icon }) => {
  const isPositive = growth > 0;
  const isNegative = growth < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {growth !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(growth)}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics; 