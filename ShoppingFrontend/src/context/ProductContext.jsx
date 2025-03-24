import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("productName");

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
        throw new Error("Invalid response format: Expected an array of products.");
      }

      productsData = productsData.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        stockQuantity: Number(product.stockQuantity) || 0,
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError({
        message: "Failed to fetch products. Please try again later.",
        details: error.message,
      });
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
      setProducts,
      isLoading,
      error,
      getAllProducts,
      refetch,
      setSearchQuery,
      setSearchField,
    }),
    [filteredProducts, isLoading, error, getAllProducts, refetch, setSearchQuery, setSearchField]
  );

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export default ProductContext;