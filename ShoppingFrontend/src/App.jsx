import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Contact from "./components/Contact";

// Lazy loading components
const Home = React.lazy(() => import("./components/Home"));
const Product = React.lazy(() => import("./components/Product/Product"));
const AddProduct = React.lazy(() => import("./components/Product/AddProduct"));
const UpdateProduct = React.lazy(() => import("./components/Product/UpdateProduct"));
const Cart = React.lazy(() => import("./components/Cart"));

const App = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element = {<Contact/>} />

          {/* Protected Routes */}
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/add"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/update/:id"
            element={
              <ProtectedRoute>
                <UpdateProduct />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
};

export default App;