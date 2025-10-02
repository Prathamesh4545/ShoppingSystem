import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useContext } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import ThemeContext from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAuth } from "../../context/AuthContext";
import { FiRefreshCw } from 'react-icons/fi';
import UserStats from './UserStats';
import ModernLoader from '../common/ModernLoader';

// Lazy Load Components for Performance
const Sidebar = lazy(() => import("./Sidebar"));
const ChartCard = lazy(() => import("./ChartCard"));

// Chart.js Registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);



// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <ModernLoader size="lg" text="Loading Dashboard..." />
  </div>
);

const Dashboard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { data, loading, error, refetch } = useDashboardData();

  // Sidebar Toggle
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Debounced Resize Handling
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const salesChartData = useMemo(() => {
    if (!data?.sales || data.sales.length === 0) return null;

    return {
      labels: data.sales.map(sale => 
        new Date(sale.date).toLocaleDateString('en-IN', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets: [{
        label: 'Orders',
        data: data.sales.map(sale => sale.orderCount || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40,
      }]
    };
  }, [data?.sales]);

  const revenueChartData = useMemo(() => {
    if (!data?.sales || data.sales.length === 0) return null;

    return {
      labels: data.sales.map(sale => 
        new Date(sale.date).toLocaleDateString('en-IN', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets: [{
        label: 'Revenue (₹)',
        data: data.sales.map(sale => sale.revenue || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    };
  }, [data?.sales]);

  const categoryData = useMemo(() => {
    if (!data?.categories || data.categories.length === 0) return null;

    const colors = [
      'rgba(59, 130, 246, 0.9)',   // Blue
      'rgba(16, 185, 129, 0.9)',   // Green
      'rgba(249, 115, 22, 0.9)',   // Orange
      'rgba(139, 92, 246, 0.9)',   // Purple
      'rgba(236, 72, 153, 0.9)',   // Pink
      'rgba(245, 158, 11, 0.9)',   // Amber
      'rgba(20, 184, 166, 0.9)',   // Teal
      'rgba(239, 68, 68, 0.9)',    // Red
    ];

    return {
      labels: data.categories.map(cat => cat.category || 'Unknown'),
      datasets: [{
        label: 'Products',
        data: data.categories.map(cat => cat.count || 0),
        backgroundColor: colors.slice(0, data.categories.length),
        borderColor: colors.slice(0, data.categories.length).map(c => c.replace('0.9', '1')),
        borderWidth: 2,
        hoverOffset: 15,
      }]
    };
  }, [data?.categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ModernLoader size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`pt-16 min-h-screen relative overflow-hidden ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 0%, transparent 50%)`
        }} />
      </div>
      
      <Suspense fallback={<LoadingFallback />}>
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`relative transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-64" : "ml-20"
          } p-6 md:p-8`}
        >
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2 leading-tight">
                Welcome back, {user?.firstName || 'Admin'}
              </h1>
              <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                Here's what's happening with your store today.
              </p>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className={`px-6 py-3 rounded-xl font-medium backdrop-blur-md border transition-all duration-300 shadow-lg hover:shadow-xl ${
                isDarkMode
                  ? "bg-gradient-to-r from-sky-800/80 to-sky-700/80 border-sky-600/50 text-white hover:from-sky-700/80 hover:to-sky-600/80"
                  : "bg-gradient-to-r from-sky-500/80 to-sky-600/80 border-sky-400/50 text-white hover:from-sky-600/80 hover:to-sky-700/80"
              }`}
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              <span>Refresh Data</span>
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="mb-10">
            <UserStats stats={data.stats} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ChartCard
              title="Daily Orders"
              ChartComponent={Bar}
              data={salesChartData}
              gradient="from-blue-500 via-indigo-500 to-purple-600"
              chartType="bar"
            />
            <ChartCard
              title="Revenue Trends"
              ChartComponent={Line}
              data={revenueChartData}
              gradient="from-emerald-500 via-teal-500 to-cyan-600"
              chartType="line"
            />
          </div>
          
          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <ChartCard
              title="Product Categories"
              ChartComponent={Doughnut}
              data={categoryData}
              gradient="from-orange-500 via-pink-500 to-rose-600"
              chartType="doughnut"
            />
            <div className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
              isDarkMode 
                ? "bg-white/5 border-white/10 shadow-purple-500/10 hover:bg-white/10" 
                : "bg-white/70 border-white/50 shadow-sky-500/10 hover:bg-white/80"
            }`}>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDarkMode ? "text-slate-200" : "text-slate-800"
              }`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/products/add" className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 block text-center">
                  Add Product
                </Link>
                <Link to="/orders" className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 block text-center">
                  View Orders
                </Link>
                <Link to="/users" className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 block text-center">
                  Manage Users
                </Link>
                <Link to="/analytics" className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 block text-center">
                  Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
