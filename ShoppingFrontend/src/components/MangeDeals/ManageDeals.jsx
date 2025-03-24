import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DealsTable from "./DealsTable";
import DealForm from "./DealForm";
import { API_URL } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";

const ManageDeals = () => {
  const { token, refreshToken, logout, isTokenExpired, hasRole } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const isAdmin = hasRole("ADMIN");

  // Fetch deals from the backend
  const fetchDeals = async () => {
    try {
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }

      const response = await fetch(`${API_URL}/deals`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deals");
      }

      const data = await response.json();
      setDeals(data);
    } catch (error) {
      toast.error("Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

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

      const response = await fetch(`${API_URL}/deals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete deal");
      }

      toast.success("Deal deleted successfully");
      fetchDeals();
    } catch (error) {
      toast.error("Failed to delete deal");
    }
  };

  // Handle editing a deal
  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  // Handle form submission (create or update a deal)
  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }

      let response;
      if (selectedDeal) {
        // PUT request for updating an existing deal
        response = await fetch(`${API_URL}/deals/${selectedDeal.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // POST request for creating a new deal
        response = await fetch(`${API_URL}/deals`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${selectedDeal ? "update" : "create"} deal`);
      }

      toast.success(`Deal ${selectedDeal ? "updated" : "created"} successfully`);
      setShowForm(false);
      setSelectedDeal(null);
      fetchDeals();
      resetForm();
    } catch (error) {
      toast.error(`Failed to ${selectedDeal ? "update" : "create"} deal`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Deals</h1>

      {/* Show "Create New Deal" button only for ADMIN users */}
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

      {/* Show the DealForm if showForm is true */}
      {showForm && (
        <DealForm
          initialValues={selectedDeal}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          isEditMode={!!selectedDeal}
        />
      )}

      {/* Show the DealsTable */}
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