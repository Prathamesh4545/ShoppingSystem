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
import Error from "./components/Error";
import AllProducts from "./components/Product/AllProducts";
import EditProfile from "./components/User/EditProfile";
import Checkout from "./components/Checkout";
import AdminOrderManager from "./components/Orders/AdminOrderManager";
import UserOrderManager from "./components/Orders/UserOrderManager";
import AddressForm from "./components/Addresses/AddressForm";
import ManageDeals from "./components/MangeDeals/ManageDeals";
import DealForm from "./components/MangeDeals/DealForm";

const Home = React.lazy(() => import("./components/Home"));
const Product = React.lazy(() => import("./components/Product/Product"));
const AddProduct = React.lazy(() => import("./components/Product/AddProduct"));
const UpdateProduct = React.lazy(() => import("./components/Product/UpdateProduct"));
const Cart = React.lazy(() => import("./components/Cart/Cart"));

const App = () => {
  const location = useLocation();

  // Routes where the Navbar should be hidden
  const hideNavbarRoutes = [
    "/admin/dashboard",
    "/users",
    "/deals/manage",
    "/products",
    "/products/add",
    "/product/update",
  ];

  return (
    <>
      {/* Hide Navbar for specific routes */}
      {!hideNavbarRoutes.some((route) => location.pathname.startsWith(route)) && <Navbar />}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service" element={<Service />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/error" element={<Error />} />
          <Route path="/product/:id" element={<Product />} />

          {/* Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute roles={["USER", "ADMIN"]}>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* Admin Order Management */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminOrderManager />
              </ProtectedRoute>
            }
          />

          {/* User Order Management */}
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute roles={["USER"]}>
                <UserOrderManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={["USER"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["USER"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute roles={["USER"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/address"
            element={
              <ProtectedRoute roles={["USER"]}>
                <AddressForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
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
              <ProtectedRoute roles={["ADMIN"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/update/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UpdateProduct />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found Route */}
          <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
};

export default App;