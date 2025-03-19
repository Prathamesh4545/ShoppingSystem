import React, { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Contact from "./components/Contact";
import Service from "./components/Service";
import Dashboard from "./components/admin/Dashboard";
import Users from "./components/User/Users";
import UserProfile from "./components/User/UserProfile";
import UnauthorizedPage from "./components/common/UnauthorizedPage";
import FAQ from "./components/FAQ";
import Deals from "./components/Deals";
import ManageDeals from "./components/admin/MangeDeals/ManageDeals";
import Error from "./components/Error";
import AllProducts from "./components/Product/AllProducts";
import EditProfile from "./components/User/EditProfile";
import DealForm from "./components/admin/MangeDeals/DealForm";

const Home = React.lazy(() => import("./components/Home"));
const Product = React.lazy(() => import("./components/Product/Product"));
const AddProduct = React.lazy(() => import("./components/Product/AddProduct"));
const UpdateProduct = React.lazy(() =>
  import("./components/Product/UpdateProduct")
);
const Cart = React.lazy(() => import("./components/Cart"));

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/admin/dashboard",
    "/users",
    "/deals/manage",
    "/products",
    "/products/add",
    "/product/update/:id",
  ];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service" element={<Service />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/error" element={<Error />} />
          <Route path="/product/:id" element={<Product />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AllProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/manage"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ManageDeals />
              </ProtectedRoute>
            }
          />
           <Route
            path="/deals/create"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DealForm isEditMode={false} />
              </ProtectedRoute>
            }
          />
           <Route
            path="/deals/edit/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DealForm isEditMode={true} />
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
            path="/product/update/:id"
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
