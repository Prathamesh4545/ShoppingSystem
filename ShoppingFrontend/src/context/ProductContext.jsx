import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

const ProductContext = ({ children }) => {
  const [products, setProducts] = useState([]);

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

  return (
    <>
      <DataContext.Provider value={{ products, setProducts, getAllProducts }}>
        {children} 
      </DataContext.Provider>
    </>
  );
};

export default ProductContext;
