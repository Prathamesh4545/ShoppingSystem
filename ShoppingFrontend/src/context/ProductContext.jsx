import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_URL } from "../config/constants";

export const DataContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    fetchProducts,
    getAllProducts: fetchProducts,
    setProducts
  }), [products, loading, error, fetchProducts]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
