import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../config/constants";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const AddressForm = ({ userId, onAddressSubmit }) => {
  const { isDark } = useContext(ThemeContext);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("SHIPPING");
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!street || !city || !state || !zipCode || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const payload = {
      street,
      city,
      state,
      zipCode,
      country,
      type,
    };

    try {
      const response = await fetch(`${API_URL}/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add address");
      }

      const newAddress = await response.json();
      onAddressSubmit(newAddress);
      toast.success("Address added successfully");

      // Clear form fields
      setStreet("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
      setType("SHIPPING");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Street
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Zip Code
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="SHIPPING">Shipping</option>
          <option value="BILLING">Billing</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDark
            ? "bg-blue-700 hover:bg-blue-800 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Adding..." : "Add Address"}
      </button>
    </form>
  );
};

export default AddressForm;
