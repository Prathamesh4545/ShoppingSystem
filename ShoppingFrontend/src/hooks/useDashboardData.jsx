import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/constants';

export const useDashboardData = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
    },
    salesData: {
      labels: [],
      data: [],
    },
    revenueData: {
      labels: [],
      data: [],
    },
    categoryData: {
      labels: [],
      data: [],
    },
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, salesResponse, categoryResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/sales`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const currentDate = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(currentDate.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      setDashboardData({
        stats: statsResponse.data,
        salesData: {
          labels: last7Days,
          data: salesResponse.data.dailySales || [],
        },
        revenueData: {
          labels: last7Days,
          data: salesResponse.data.dailyRevenue || [],
        },
        categoryData: {
          labels: categoryResponse.data.map(cat => cat.name) || [],
          data: categoryResponse.data.map(cat => cat.count) || [],
        },
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data initially
  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Set up polling for real-time updates (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  return { dashboardData, loading, error, refetch: fetchDashboardData };
}; 