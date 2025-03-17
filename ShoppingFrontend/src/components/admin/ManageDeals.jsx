import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { isTokenExpired } from "../../utils/auth";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/solid";
import { format } from "date-fns";

const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    productIds: [],
  });

  const { token, logout, hasRole, user } = useAuth();

  // Fetch deals from the API
  const fetchDeals = async () => {
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:8080/api/deals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch deals. Please try again.");
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from the API
  const fetchProducts = async () => {
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:8080/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch products. Please try again.");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, options } = e.target;

    if (type === "select-multiple") {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData({ ...formData, [name]: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission for creating a deal
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/deals",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeals([...deals, response.data]);
      setShowCreateForm(false);
      setFormData({ title: "", description: "", discountPercentage: "", imageUrl: "", startDate: "", endDate: "", productIds: [] });
    } catch (error) {
      console.error("Error creating deal:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to create deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for updating a deal
  const handleUpdateDeal = async (e) => {
    e.preventDefault();
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `http://localhost:8080/api/deals/${currentDeal.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeals(deals.map(deal => deal.id === currentDeal.id ? response.data : deal));
      setShowEditForm(false);
      setFormData({ title: "", description: "", discountPercentage: "", imageUrl: "", startDate: "", endDate: "", productIds: [] });
    } catch (error) {
      console.error("Error updating deal:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to update deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a deal
  const handleDeleteDeal = async (dealId) => {
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout();
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.delete(`http://localhost:8080/api/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(deals.filter(deal => deal.id !== dealId));
    } catch (error) {
      console.error("Error deleting deal:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Failed to delete deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a deal
  const handleEditDeal = (deal) => {
    setCurrentDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description,
      discountPercentage: deal.discountPercentage,
      imageUrl: deal.imageUrl,
      startDate: format(new Date(deal.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(deal.endDate), "yyyy-MM-dd"),
      productIds: deal.products ? deal.products.map(product => product.id) : [], // Null check here
    });
    setShowEditForm(true);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      {/* Header and Create Deals Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Manage Deals</h1>
        {hasRole("ADMIN") && (
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
            }}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {showCreateForm ? "Cancel" : "Create Deal"}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Loading Indicator */}
      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      {/* Create Deals Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Create New Deal</h2>
          <form onSubmit={handleCreateDeal}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Discount Percentage</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Products</label>
                <select
                  name="productIds"
                  value={formData.productIds}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  multiple
                  required
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Deal"}
            </button>
          </form>
        </div>
      )}

      {/* Edit Deals Form */}
      {showEditForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Edit Deal</h2>
          <form onSubmit={handleUpdateDeal}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Discount Percentage</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 dark:text-white">Products</label>
                <select
                  name="productIds"
                  value={formData.productIds}
                  onChange={handleInputChange}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                  multiple
                  required
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Deal"}
            </button>
          </form>
        </div>
      )}

      {/* Deals Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <table className="w-full text-sm text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Discount Percentage</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">End Date</th>
              <th className="px-6 py-3">Products</th>
              {hasRole("ADMIN") && <th className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No deals found.
                </td>
              </tr>
            ) : (
              deals.map((deal, index) => {
                const productNames = deal.products 
                  ? deal.products.map(product => product.productName).join(", ") 
                  : "No products"; // Null check here
                return (
                  <tr
                    key={deal.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{deal.title}</td>
                    <td className="px-6 py-4">{deal.description}</td>
                    <td className="px-6 py-4">{deal.discountPercentage}%</td>
                    <td className="px-6 py-4">
                      {format(new Date(deal.startDate), "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(deal.endDate), "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4">{productNames}</td>
                    {hasRole("ADMIN") && (
                      <td className="px-6 py-4 flex space-x-2">
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageDeals;