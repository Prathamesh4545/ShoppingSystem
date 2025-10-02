import React, { useState, useContext, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContext from "../../context/ThemeContext";
import { API_URL } from "../../config/constants";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBuilding, FaCity, FaGlobe, FaEnvelope } from "react-icons/fa";

const AddressForm = ({ 
  onAddressAdded, 
  onAddressUpdated, 
  refreshAddresses,
  initialData,
  onClose 
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
    phone: "",
    name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        street: initialData.street || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        country: initialData.country || "",
        isDefault: initialData.type === "BILLING" || false,
        phone: initialData.phone || "",
        name: initialData.name || ""
      });
    }
  }, [initialData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user?.id) {
      toast.error("User not authenticated. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      isDefault: formData.isDefault,
      phone: formData.phone,
      name: formData.name,
      userId: user.id,
      type: formData.isDefault ? "BILLING" : "SHIPPING"
    };

    try {
      const url = initialData 
        ? `${API_URL}/address/${initialData.id}`
        : `${API_URL}/address`;
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      const savedAddress = await response.json();
      
      if (initialData && typeof onAddressUpdated === 'function') {
        onAddressUpdated(savedAddress);
      } else if (!initialData && typeof onAddressAdded === 'function') {
        onAddressAdded(savedAddress);
      }

      setFormData({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false,
      });
      
      toast.success(`Address ${initialData ? 'updated' : 'added'} successfully`);

      if (typeof refreshAddresses === 'function') {
        await refreshAddresses();
      }

      if (typeof onClose === 'function') {
        onClose();
      }

    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {initialData ? 'Edit Address' : 'Add New Address'}
      </h2>
      <p className={`mb-8 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {initialData ? 'Update your address details below' : 'Fill in the details below to add your address.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">

          {/* Street Address */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Street Address
            </label>
            <div className="relative">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Enter your street address"
                required
              />
            </div>
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          {/* Zip Code and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Zip/Postal Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Enter zip code"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Enter country"
                required
              />
            </div>
          </div>

          {/* Address Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Address Type
            </label>
            <select
              name="isDefault"
              value={formData.isDefault ? "BILLING" : "SHIPPING"}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.value === "BILLING" })}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              <option value="SHIPPING">Shipping Address</option>
              <option value="BILLING">Billing Address</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded-md ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {initialData ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              initialData ? 'Update Address' : 'Add Address'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;