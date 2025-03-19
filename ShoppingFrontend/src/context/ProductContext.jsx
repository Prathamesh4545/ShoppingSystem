// ProductContext.jsx
import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]); // Define setProducts
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("productName");

  // Fetch all products from the API
  const getAllProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      let productsData = [];

      // Handle different response formats
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else {
        throw new Error("Invalid response format: Expected an array of products.");
      }

      setProducts(productsData); // Use setProducts
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
  }, []);

  // Refetch products
  const refetch = useCallback(() => {
    getAllProducts();
  }, [getAllProducts]);

  // Filter products based on search query and field
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => {
      const value = product[searchField]?.toString().toLowerCase() || "";
      return searchQuery ? value.includes(searchQuery.toLowerCase()) : true;
    });
  }, [products, searchQuery, searchField]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      products: filteredProducts,
      setProducts, // Provide setProducts
      isLoading,
      error,
      getAllProducts,
      refetch,
      setSearchQuery,
      setSearchField,
    }),
    [filteredProducts, isLoading, error, getAllProducts, refetch, setSearchQuery, setSearchField]
  );

  // Fetch products on mount
  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default ProductContext;