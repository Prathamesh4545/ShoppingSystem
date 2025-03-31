import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DealsTable from "./DealsTable";
import DealForm from "./DealForm";
import { API_URL, PRODUCTS_ENDPOINT } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const ManageDeals = () => {
  const { token, refreshToken, logout, isTokenExpired, hasRole } = useAuth();
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const isAdmin = hasRole("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch deals and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentToken = token;
        if (isTokenExpired(currentToken)) {
          currentToken = await refreshToken();
          if (!currentToken) {
            logout();
            return;
          }
        }

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
        toast.error("Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshToken, logout, isTokenExpired]);

  // Handle deleting a deal
  const handleDelete = async (id) => {
    try {
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }

      await axios.delete(`${API_URL}/deals/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      toast.success("Deal deleted successfully");
      setDeals(deals.filter((deal) => deal.id !== id));
    } catch (error) {
      toast.error("Failed to delete deal");
      toast.error(error.response?.data?.message || "Failed to delete deal");
    }
  };

  // Handle editing a deal
  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }
  
      // Format dates to YYYY-MM-DD (without time)
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
  
      const formattedData = {
        title: formData.title,
        description: formData.description,
        discountPercentage: Number(formData.discountPercentage),
        startDate: formatDate(formData.startDate), // Format to YYYY-MM-DD
        endDate: formatDate(formData.endDate),     // Format to YYYY-MM-DD
        startTime: formData.startTime,
        endTime: formData.endTime,
        isActive: Boolean(formData.isActive),
        productIds: formData.products.map(product => product.id)
      };
  
      const formDataToSend = new FormData();
      Object.entries(formattedData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => formDataToSend.append(key, item));
        } else {
          formDataToSend.append(key, value);
        }
      });
  
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (selectedDeal) {
        response = await axios.put(
          `${API_URL}/deals/${selectedDeal.id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
        setDeals(
          deals.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
        );
      } else {
        setDeals([...deals, updatedDeal]);
      }

      setShowForm(false);
      setSelectedDeal(null);
    } catch (error) {
      console.error("Error saving deal:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error saving deal";
      toast.error(errorMessage);

      // Log detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request:", error.request);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Deals</h1>

      {isAdmin && (
        <button
          onClick={() => {
            setSelectedDeal(null);
            setShowForm(true);
          }}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Create New Deal
        </button>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
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
          </div>
        </div>
      )}

      <DealsTable
        deals={deals}
        loading={loading}
        onDelete={isAdmin ? handleDelete : null}
        onEdit={isAdmin ? handleEdit : null}
        hasRole={hasRole}
      />
    </div>
  );
};

export default ManageDeals;
