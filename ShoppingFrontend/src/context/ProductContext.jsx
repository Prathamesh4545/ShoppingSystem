import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("productName");

  const clearError = () => setError(null);

  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  };

  const getAllProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      let productsData = [];

      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else {
        throw new Error("Invalid products data format received from server");
      }

      productsData = productsData.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        stockQuantity: Number(product.stockQuantity) || 0,
      }));
      
      setProducts(productsData);
    } catch (error) {
      handleApiError(error, "Failed to fetch products. Please try again later.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    getAllProducts();
  }, [getAllProducts]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter((product) => {
      const value = product[searchField]?.toString().toLowerCase() || "";
      return searchQuery ? value.includes(searchQuery.toLowerCase()) : true;
    });
  }, [products, searchQuery, searchField]);

  const contextValue = useMemo(
    () => ({
      products: filteredProducts,
      allProducts: products,
      isLoading,
      error,
      getAllProducts,
      refetch,
      setSearchQuery,
      setSearchField,
      clearError,
    }),
    [filteredProducts, products, isLoading, error, getAllProducts, refetch]
  );

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default ProductContext;