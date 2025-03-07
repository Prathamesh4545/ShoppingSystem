import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name");

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      setProducts(response.data);
    } catch (error) {
      console.log("Error fetching products");
    }
  };

  const filteredProducts = products.filter(product => {
    const value = product[searchField]?.toString().toLowerCase() || "";
    return value.includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <DataContext.Provider
        value={{
          products: filteredProducts,
          getAllProducts,
          setSearchQuery,
          setSearchField,
        }}
      >
        {children}
      </DataContext.Provider>
    </>
  );
};

export default ProductContext;
