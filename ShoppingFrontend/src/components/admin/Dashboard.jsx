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
} from "react-icons/fa";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

// Lazy Load Components for Performance
const Sidebar = lazy(() => import("./Sidebar"));
const UserStats = lazy(() => import("./UserStats"));
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

// Static Chart Data (Optimized with useMemo)
const useChartData = () =>
  useMemo(
    () => ({
      salesData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Sales",
            data: [5000, 7000, 4500, 8000, 6000, 9000, 7500],
            backgroundColor: "rgba(99, 102, 241, 0.8)",
          },
        ],
      },
      revenueData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Revenue",
            data: [20000, 25000, 22000, 28000, 30000, 32000, 35000],
            borderColor: "rgba(52, 211, 153, 1)",
            backgroundColor: "rgba(52, 211, 153, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      categoryData: {
        labels: ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys"],
        datasets: [
          {
            data: [35, 25, 20, 10, 10],
            backgroundColor: [
              "#EF4444",
              "#3B82F6",
              "#FBBF24",
              "#10B981",
              "#8B5CF6",
            ],
          },
        ],
      },
    }),
    []
  );

const Dashboard = () => {
  const { isDark } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { salesData, revenueData, categoryData } = useChartData();

  // Sidebar Toggle
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Debounced Resize Handling
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <Suspense
        fallback={<div className="text-center text-gray-500">Loading...</div>}
      >
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`transition-all ${sidebarOpen ? "ml-64" : "ml-20"} p-8`}
        >
          <UserStats />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ChartCard
              title="Sales Overview"
              ChartComponent={Bar}
              data={salesData}
            />
            <ChartCard
              title="Revenue Trends"
              ChartComponent={Line}
              data={revenueData}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Product Categories"
              ChartComponent={Doughnut}
              data={categoryData}
            />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
