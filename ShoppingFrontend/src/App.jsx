import React, { Suspense } from "react";
import { Route, Routes} from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading components
const Home = React.lazy(() => import("./components/Home"));
const GetProductById = React.lazy(() => import("./components/Product/GetProductById"));
const Product = React.lazy(() => import("./components/Product/Product"));
const AddProduct = React.lazy(() => import("./components/Product/AddProduct"));
const UpdateProduct = React.lazy(() => import("./components/Product/UpdateProduct"));
const Cart = React.lazy(() => import("./components/Cart"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<GetProductById />} />
          <Route path="/cart" element={<Cart />} />

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
        </Routes>
        <Footer />
      </Suspense>
    </>
  );
};

export default App;
