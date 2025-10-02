import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useDashboardData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [stats, sales, categories] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/sales`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/categories`, config)
            ]);

            setData({
                stats: stats.data,
                sales: sales.data.dailySales,
                categories: categories.data
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
        
        // Set up auto-refresh
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        
        return () => clearInterval(interval);
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}; 