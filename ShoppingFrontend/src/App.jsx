import React, { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./components/Auth/PrivateRoute.jsx";
import AdminRoute from "./components/Auth/AdminRoute.jsx";
import FloatingActionButton from "./components/common/FloatingActionButton";
import { NotificationProvider } from "./context/NotificationContext";

// Common Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import UnauthorizedPage from "./components/common/UnauthorizedPage";

// Public Components
import Home from "./components/Home";
import Contact from "./components/Contact";
import Service from "./components/Service";
import FAQ from "./components/FAQ";
import Deals from "./components/Deals";
import Error from "./components/Error";
import Product from "./components/Product/Product";

// User Components
import Cart from "./components/Cart/Cart";
import Checkout from "./components/Checkout/Checkout";
import OrdersList from "./components/Orders/OrdersList";
import OrderDetails from "./components/Orders/OrderDetails";
import AddressForm from "./components/Addresses/AddressForm";

// Admin Components
import Dashboard from "./components/Admin/Dashboard.jsx";
import Analytics from "./components/Admin/Analytics.jsx";
import AllProducts from "./components/Product/AllProducts";
import AddProduct from "./components/Product/AddProduct";
import UpdateProduct from "./components/Product/UpdateProduct";
import ManageDeals from "./components/MangeDeals/ManageDeals";
import DealForm from "./components/MangeDeals/DealForm";
import AdminOrderManager from "./components/Orders/AdminOrderManager";
import UserProfile from "./components/Users/UserProfile.jsx";
import Users from "./components/Users/Users.jsx";
import NotificationDemo from "./components/common/NotificationDemo.jsx";

const App = () => {
  const location = useLocation();

  // Admin routes where the Navbar and Footer should be hidden
  const adminRoutes = [
    "/admin",
    "/analytics",
    "/users",
    "/deals/manage",
    "/deals/create",
    "/deals/edit",
    "/products",
    "/products/add",
    "/product/update",
    "/orders",
  ];

  // Check if current path is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Custom loading component for admin routes
  const AdminLoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <LoadingSpinner />
    </div>
  );

  return (
    <NotificationProvider>
      <div className={`${isAdminRoute ? "min-h-screen bg-gray-900" : ""} relative`}>
        {/* Show Navbar only for non-admin routes */}
        {!isAdminRoute && <Navbar />}

      <Suspense
        fallback={isAdminRoute ? <AdminLoadingSpinner /> : <LoadingSpinner />}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service" element={<Service />} />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/deals"
            element={
              <PrivateRoute roles={["USER", "ADMIN"]}>
                <Deals />
              </PrivateRoute>
            }
          />
          <Route path="/notifications-demo" element={<NotificationDemo />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/error" element={<Error />} />
          <Route path="/product/:id" element={<Product />} />

          {/* Protected User Routes */}
          <Route
            path="/cart"
            element={
              <PrivateRoute roles={["USER", "ADMIN"]}>
                <Cart />
              </PrivateRoute> 
            }
          />

          <Route
            path="/my-orders"
            element={
              <PrivateRoute roles={["USER"]}>
                <OrdersList />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <PrivateRoute roles={["USER"]}>
                <OrderDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute roles={["USER"]}>
                <UserProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/address"
            element={
              <PrivateRoute roles={["USER"]}>
                <AddressForm />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/analytics"
            element={
              <AdminRoute>
                <Analytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/products"
            element={
              <AdminRoute>
                <AllProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          <Route
            path="/deals/manage"
            element={
              <AdminRoute>
                <ManageDeals />
              </AdminRoute>
            }
          />

          <Route
            path="/deals/create"
            element={
              <AdminRoute>
                <DealForm isEditMode={false} />
              </AdminRoute>
            }
          />

          <Route
            path="/deals/edit/:id"
            element={
              <AdminRoute>
                <DealForm isEditMode={true} />
              </AdminRoute>
            }
          />

          <Route
            path="/products/add"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/product/update/:id"
            element={
              <AdminRoute>
                <UpdateProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <AdminRoute>
                <AdminOrderManager />
              </AdminRoute>
            }
          />

          {/* 404 Not Found Route */}
          <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
      </Suspense>

      {/* Show Footer only for non-admin routes */}
      {!isAdminRoute && <Footer />}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="z-50"
      />
      
        {/* Global Components */}
        {!isAdminRoute && <FloatingActionButton />}
      </div>
    </NotificationProvider>
  );
};

export default App;
