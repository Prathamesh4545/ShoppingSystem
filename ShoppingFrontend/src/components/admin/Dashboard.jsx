import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  FaBars,
  FaHome,
  FaBox,
  FaPlusCircle,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaSpinner,
  FaSync,
} from "react-icons/fa";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAuth } from "../../context/AuthContext";
import { FiRefreshCw } from 'react-icons/fi';
import UserStats from './UserStats';
import { LineChart, PieChart } from './Charts';
import { Spinner } from '../common/Spinner';

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

// Sidebar Links
const sidebarLinks = [
  { name: "Dashboard", path: "/", icon: <FaHome className="h-5 w-5" /> },
  { name: "Products", path: "/products", icon: <FaBox className="h-5 w-5" /> },
  {
    name: "Add Products",
    path: "/products/add",
    icon: <FaPlusCircle className="h-5 w-5" />,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: <FaShoppingCart className="h-5 w-5" />,
  },
  { name: "Users", path: "/users", icon: <FaUsers className="h-5 w-5" /> },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <FaChartLine className="h-5 w-5" />,
  },
];

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const Dashboard = () => {
  const { isDark } = useContext(ThemeContext);
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

  const chartData = useMemo(() => {
    if (!data?.sales) return null;

    return {
      labels: data.sales.map(sale => new Date(sale.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Orders',
          data: data.sales.map(sale => sale.orderCount),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Daily Revenue (₹)',
          data: data.sales.map(sale => sale.revenue),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };
  }, [data?.sales]);

  const categoryData = useMemo(() => {
    if (!data?.categories) return null;

    return {
      labels: data.categories.map(cat => cat.category),
      datasets: [{
        data: data.categories.map(cat => cat.count),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#7CBA3B', '#B2B2B2'
        ]
      }]
    };
  }, [data?.categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
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
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-64" : "ml-20"
          } p-6 md:p-8`}
        >
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2`}>
                Welcome back, {user?.firstName || 'Admin'}
              </h1>
              <p className={`text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Here's what's happening with your store today.
              </p>
            </div>
            <button
              onClick={refetch}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 
                bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <UserStats stats={data.stats} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <ChartCard
              title="Sales Overview"
              ChartComponent={Bar}
              data={chartData}
              gradient="from-blue-500 to-purple-600"
            />
            <ChartCard
              title="Revenue Trends"
              ChartComponent={Line}
              data={chartData}
              gradient="from-green-500 to-teal-600"
            />
            <ChartCard
              title="Product Categories"
              ChartComponent={Doughnut}
              data={categoryData}
              gradient="from-orange-500 to-pink-600"
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
