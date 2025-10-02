import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaSync, FaTags } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DealsTable from "./DealsTable";
import DealForm from "./DealForm";
import { API_URL, PRODUCTS_ENDPOINT } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";
import ThemeContext from "../../context/ThemeContext";
import axios from "axios";

const ManageDeals = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { token, refreshToken, logout, isTokenExpired, hasRole } = useAuth();
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const isAdmin = hasRole("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Helper function to handle token refresh
  const getValidToken = async () => {
    let currentToken = token;
    if (isTokenExpired(currentToken)) {
      currentToken = await refreshToken();
      if (!currentToken) {
        logout();
        return null;
      }
    }
    return currentToken;
  };

  // Fetch deals and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentToken = await getValidToken();
        if (!currentToken) return;

        const [dealsResponse, productsResponse] = await Promise.all([
          axios.get(`${API_URL}/deals`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          }),
          axios.get(PRODUCTS_ENDPOINT, {
            headers: { Authorization: `Bearer ${currentToken}` },
          }),
        ]);

        setDeals(dealsResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          toast.error("Session expired. Please login again.");
        } else {
          toast.error("Failed to fetch data");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshToken, logout, isTokenExpired]);

  // Handle deleting a deal
  const handleDelete = async (id) => {
    try {
      const currentToken = await getValidToken();
      if (!currentToken) return;

      await axios.delete(`${API_URL}/deals/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      toast.success("Deal deleted successfully");
      setDeals(deals.filter((deal) => deal.id !== id));
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete deal");
      }
    }
  };

  // Handle toggling deal status
  const handleToggleStatus = async (id, isActive) => {
    try {
      console.log('Toggling deal status:', { id, isActive });
      const currentToken = await getValidToken();
      if (!currentToken) return;

      await axios.patch(
        `${API_URL}/deals/${id}/status?isActive=${isActive}`,
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === id ? { ...deal, isActive } : deal
        )
      );
      toast.success(`Deal ${isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error('Toggle status error:', error);
      if (error.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update deal status");
      }
    }
  };

  // Handle updating expired deals
  const handleUpdateExpiredDeals = async () => {
    try {
      setIsUpdatingStatus(true);
      const currentToken = await getValidToken();
      if (!currentToken) return;

      await axios.post(
        `${API_URL}/deals/update-expired`,
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      // Refresh deals list
      const dealsResponse = await axios.get(`${API_URL}/deals`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setDeals(dealsResponse.data);

      toast.success("Deal statuses updated successfully");
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to update deal statuses");
        console.error("Status update error:", error);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const currentToken = await getValidToken();
      if (!currentToken) return;

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("discountPercentage", Number(formData.discountPercentage));
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("startTime", formData.startTime);
      formDataToSend.append("endTime", formData.endTime);
      formDataToSend.append("isActive", Boolean(formData.isActive));
      
      // Send product IDs as individual form fields
      formData.products.forEach(product => {
        formDataToSend.append("productIds", product.id);
      });

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (selectedDeal) {
        response = await axios.put(`${API_URL}/deals/${selectedDeal.id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Deal updated successfully");
      } else {
        response = await axios.post(`${API_URL}/deals`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Deal created successfully");
      }

      // Update local state
      const updatedDeal = response.data;
      if (selectedDeal) {
        setDeals(deals.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal)));
      } else {
        setDeals([...deals, updatedDeal]);
      }

      setShowForm(false);
      setSelectedDeal(null);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Error saving deal";
        toast.error(errorMessage);
        console.error("Error saving deal:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a deal
  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

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
      {/* Animated Background Elements */}
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
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className={`p-4 rounded-2xl backdrop-blur-md border shadow-2xl ${
                isDarkMode 
                  ? "bg-white/10 border-white/20 shadow-purple-500/20" 
                  : "bg-white/70 border-white/50 shadow-sky-500/20"
              }`}>
                <FaTags className={`w-8 h-8 ${
                  isDarkMode ? "text-sky-400" : "text-sky-600"
                }`} />
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? "from-sky-400 via-purple-400 to-sky-400" 
                    : "from-sky-600 via-purple-600 to-sky-600"
                }`}>
                  Manage Deals
                </h1>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  Create and manage promotional deals
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateExpiredDeals}
                  disabled={isUpdatingStatus}
                  className={`px-6 py-3 rounded-xl font-medium backdrop-blur-md border transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 ${
                    isDarkMode
                      ? "bg-gradient-to-r from-green-800/80 to-green-700/80 border-green-600/50 text-white hover:from-green-700/80 hover:to-green-600/80"
                      : "bg-gradient-to-r from-green-500/80 to-green-600/80 border-green-400/50 text-white hover:from-green-600/80 hover:to-green-700/80"
                  }`}
                >
                  <FaSync className={`mr-2 ${isUpdatingStatus ? "animate-spin" : ""}`} />
                  Update Status
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDeal(null);
                    setShowForm(true);
                  }}
                  className={`px-6 py-3 rounded-xl font-medium backdrop-blur-md border transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isDarkMode
                      ? "bg-gradient-to-r from-sky-800/80 to-sky-700/80 border-sky-600/50 text-white hover:from-sky-700/80 hover:to-sky-600/80"
                      : "bg-gradient-to-r from-sky-500/80 to-sky-600/80 border-sky-400/50 text-white hover:from-sky-600/80 hover:to-sky-700/80"
                  }`}
                >
                  <FaPlus className="mr-2" />
                  Create Deal
                </motion.button>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-2xl"
                >
                  <DealForm
                    deal={selectedDeal}
                    products={products}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setSelectedDeal(null);
                    }}
                    isSubmitting={isSubmitting}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DealsTable
              deals={deals}
              loading={loading}
              onDelete={isAdmin ? handleDelete : null}
              onEdit={isAdmin ? handleEdit : null}
              onToggleStatus={isAdmin ? handleToggleStatus : null}
              hasRole={hasRole}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageDeals;