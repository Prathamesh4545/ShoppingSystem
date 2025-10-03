import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ShippingSettings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    standardShippingFee: '',
    expressShippingFee: '',
    freeShippingThreshold: '',
    standardDeliveryDays: '',
    expressDeliveryDays: '',
    freeShippingEnabled: true
  });

  useEffect(() => {
    fetchShippingConfig();
  }, []);

  const fetchShippingConfig = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipping/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to load shipping configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/shipping/config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Shipping configuration updated successfully!');
    } catch (error) {
      toast.error('Failed to update shipping configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaTruck className="text-3xl text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Settings</h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              name="standardShippingFee"
              value={config.standardShippingFee}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Express Shipping Fee (₹)
            </label>
            <input
              type="number"
              name="expressShippingFee"
              value={config.expressShippingFee}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              name="freeShippingThreshold"
              value={config.freeShippingThreshold}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Standard Delivery Days
            </label>
            <input
              type="number"
              name="standardDeliveryDays"
              value={config.standardDeliveryDays}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Express Delivery Days
            </label>
            <input
              type="number"
              name="expressDeliveryDays"
              value={config.expressDeliveryDays}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="freeShippingEnabled"
            checked={config.freeShippingEnabled}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            Enable Free Shipping (when order exceeds threshold)
          </label>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Settings Preview</h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>• Standard Shipping: ₹{config.standardShippingFee} ({config.standardDeliveryDays} days)</p>
          <p>• Express Shipping: ₹{config.expressShippingFee} ({config.expressDeliveryDays} days)</p>
          <p>• Free Shipping: {config.freeShippingEnabled ? `On orders above ₹${config.freeShippingThreshold}` : 'Disabled'}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ShippingSettings;
