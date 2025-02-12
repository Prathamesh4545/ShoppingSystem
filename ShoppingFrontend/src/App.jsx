import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import GetProductById from "./components/GetProductById";
import Product from "./components/Product";
import { Route, Routes } from "react-router-dom";
import AddProduct from "./components/AddProduct";
import Footer from "./components/Footer";
import UpdateProduct from "./components/UpdateProduct";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/product/add" element={<AddProduct />} />
        <Route path="/product" element={<GetProductById />} />
        <Route path="/product/update/:id" element={<UpdateProduct />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
 