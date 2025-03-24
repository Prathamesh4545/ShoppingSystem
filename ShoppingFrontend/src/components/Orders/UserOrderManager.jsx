import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import OrderList from "./OrderList";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const UserOrderManager = () => {
  const { isDark } = useContext(ThemeContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "You do not have permission to access this resource."
          );
        } else {
          throw new Error("Failed to fetch orders");
        }
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
      if (error.message.includes("permission")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div
      className={`min-h-screen p-10 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
    >
      <div className="pt-20 max-w-4xl mx-auto">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <OrderList orders={orders} />
        )}
      </div>
    </div>
  );
};

export default UserOrderManager;
