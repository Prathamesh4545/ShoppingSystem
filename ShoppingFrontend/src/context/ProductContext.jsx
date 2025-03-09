import axios from "axios";
import React, { createContext, useEffect, useState, useMemo } from "react";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("productName");

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      console.log("API Response:", response.data); // Debugging

      // Handle different response formats
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else {
        throw new Error("Invalid response format: Expected an array of products.");
      }

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError({
        message: "Failed to fetch products. Please try again later.",
        details: error.message,
      });
      setProducts([]); // Fallback to an empty array
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    getAllProducts();
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return []; // Fallback to an empty array
    }
    return products.filter((product) => {
      const value = product[searchField]?.toString().toLowerCase() || "";
      return searchQuery ? value.includes(searchQuery.toLowerCase()) : true;
    });
  }, [products, searchQuery, searchField]);

  const contextValue = useMemo(() => ({
    products: filteredProducts,
    isLoading,
    error,
    getAllProducts,
    refetch,
    setSearchQuery,
    setSearchField,
  }), [filteredProducts, isLoading, error, getAllProducts, refetch, setSearchQuery, setSearchField]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default ProductContext;