import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../config/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const AdminOrderManager = () => {
  const { isDark } = useContext(ThemeContext);
  const { token, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);

  const validStatuses = useMemo(
    () => ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
    []
  );

  const handleAuthError = useCallback(() => {
    toast.error("Session expired. Please login again.");
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const fetchOrders = useCallback(async () => {
    setFetchLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !hasRole("ADMIN")) {
        throw new Error("Unauthorized access");
      }

      const response = await axios.get(`${API_URL}/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure the response data is an array
      const data = response.data.orders || response.data || [];

      setOrders(
        (Array.isArray(data) ? data : []).map((order) => ({
          ...order,
          totalAmount: Number(order.totalAmount || 0).toFixed(2),
          createdAt: new Date(order.createdAt).toLocaleDateString(),
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      }
    } finally {
      setFetchLoading(false);
    }
  }, [isAuthenticated, token, hasRole, handleAuthError]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!validStatuses.includes(newStatus)) {
      toast.error("Invalid order status");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data;
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...updatedOrder,
                totalAmount: Number(updatedOrder.totalAmount || 0).toFixed(2),
                createdAt: new Date(
                  updatedOrder.createdAt
                ).toLocaleDateString(),
              }
            : order
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 404) {
        toast.error("Order not found.");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        handleAuthError();
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update order status"
        );
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !hasRole("ADMIN")) {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [fetchOrders, isAuthenticated, hasRole, navigate]);

  if (fetchLoading) return <LoadingSpinner />;

  return (
    <div
      className={`p-8 ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Admin Order Management
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 text-left">Order ID</th>
              <th className="py-3 px-4 text-left">User ID</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">{order.userId}</td>
                  <td className="py-3 px-4">{order.createdAt}</td>
                  <td className="py-3 px-4">${order.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updateLoading}
                    >
                      {validStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-3 px-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderManager;
