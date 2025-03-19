import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL, DEALS_ENDPOINT } from "../../../config/constants";
import DealsTable from "./DealsTable";

const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  // Fetch deals from the API
  const fetchDeals = async () => {
    if (!token) {
      logout();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(DEALS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  // Delete a deal
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;

    try {
      await axios.delete(`${DEALS_ENDPOINT}/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals((prev) => prev.filter((deal) => deal.id !== dealId));
      toast.success("Deal deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete deal");
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [token]);

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Manage Deals</h1>
        {hasRole("ADMIN") && (
          <button
            onClick={() => navigate("/deals/create")}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Create Deal
          </button>
        )}
      </div>

      <DealsTable
        deals={deals}
        loading={loading}
        onDelete={handleDeleteDeal}
        hasRole={hasRole}
        navigate={navigate}
      />
    </div>
  );
};

export default ManageDeals;