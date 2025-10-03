import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ShippingBanner = () => {
  const [shippingConfig, setShippingConfig] = useState(null);

  useEffect(() => {
    fetchShippingConfig();
  }, []);

  const fetchShippingConfig = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipping/config`);
      setShippingConfig(response.data);
    } catch (error) {
      console.warn('Failed to fetch shipping config');
    }
  };

  if (!shippingConfig?.freeShippingEnabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-3 px-4 text-center shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-semibold">
        <span>🎉</span>
        <span>FREE SHIPPING on orders above ₹{shippingConfig.freeShippingThreshold}</span>
        <span>🎉</span>
      </div>
    </motion.div>
  );
};

export default ShippingBanner;
