import { useState, useEffect, Fragment, useContext } from "react";
import { useUser } from "../../context/UserContext";
import { DataContext } from "../../context/ProductContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { API_URL } from "../../config/constants";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaImage,
  FaPlus,
} from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import AddressForm from "../Addresses/AddressForm";

const UserProfile = () => {
  const { products } = useContext(DataContext);
  const { user, updateUser } = useUser();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState({
    orders: false,
    addresses: false,
    deleting: false,
    submitting: false,
  });
  const [error, setError] = useState({ orders: null, addresses: null });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        password: "",
      });
      setImagePreview(user.imagePreview || null);
    }
  }, [user]);

  // Fetch data when tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        if (activeTab === "orders" && orders.length === 0) {
          setLoading((prev) => ({ ...prev, orders: true }));
          const response = await axios.get(`${API_URL}/orders/user/${user.id}`);
          const ordersWithTotals = response.data.map((order) => ({
            ...order,
            total: order.total !== undefined ? order.total : 0,
          }));
          setOrders(ordersWithTotals);
        } else if (activeTab === "addresses" && addresses.length === 0) {
          setLoading((prev) => ({ ...prev, addresses: true }));
          const response = await axios.get(
            `${API_URL}/address/user/${user.id}`
          );
          setAddresses(response.data);
        }
      } catch (err) {
        setError((prev) => ({ ...prev, [activeTab]: err.message }));
        toast.error(`Failed to load ${activeTab}`);
      } finally {
        setLoading((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchData();
  }, [activeTab, user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      "userName",
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
    ];
    const missingField = requiredFields.find(
      (field) => !formData[field]?.trim()
    );

    if (missingField) {
      toast.error(
        `${missingField.replace(/([A-Z])/g, " $1").trim()} is required`
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        formData.phoneNumber
      )
    ) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      await updateUser(formData, imageFile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Invalid image format (JPEG, PNG, GIF only)");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      setLoading((prev) => ({ ...prev, deleting: true }));
      await axios.delete(`${API_URL}/address/${addressId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      toast.success("Address deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete address");
    } finally {
      setLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleAddressSubmitSuccess = async () => {
    try {
      setLoading((prev) => ({ ...prev, addresses: true }));
      const response = await axios.get(`${API_URL}/address/user/${user.id}`);
      setAddresses(response.data);
    } catch (err) {
      setError((prev) => ({ ...prev, addresses: err.message }));
      toast.error("Failed to refresh addresses");
    } finally {
      setLoading((prev) => ({ ...prev, addresses: false }));
    }
    handleCloseAddressModal();
  };

  if (!user) return <LoadingSpinner fullScreen />;

  return (
    <div
      className={`pt-20 min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } py-8`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          className={`rounded-lg shadow-sm p-6 mb-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              My Account
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div
          className={`rounded-lg shadow-sm mb-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <nav className="flex space-x-8 px-6 border-b border-gray-200 dark:border-gray-700">
            {["profile", "orders", "addresses"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : `border-transparent ${
                        isDark
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div
            className={`rounded-lg shadow-sm p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-4xl ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {(
                          user.firstName?.[0] ||
                          user.userName?.[0] ||
                          "?"
                        ).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <FaImage className="h-5 w-5" />
                    </label>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {isEditing
                    ? "Upload new photo (JPEG/PNG/GIF, max 5MB)"
                    : "Click edit to update profile photo"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="First Name"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock
                        className={`h-5 w-5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDark
                          ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                          : "border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                      placeholder="New Password"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={`px-4 py-2 border rounded-md ${
                      isDark
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading.submitting}
                    className={`px-4 py-2 rounded-md text-white ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } ${
                      loading.submitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading.submitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div
            className={`rounded-lg shadow-sm p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-lg font-medium mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Order History
            </h2>

            {loading.orders ? (
              <LoadingSpinner />
            ) : error.orders ? (
              <div
                className={`p-4 rounded-md ${
                  isDark ? "bg-gray-700" : "bg-red-50"
                } text-red-500`}
              >
                {error.orders}
              </div>
            ) : orders.length === 0 ? (
              <p
                className={`text-center py-8 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No orders found
              </p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className={`font-medium ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Order #{order.id}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(order.createdAt).toLocaleDateString()} •
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className={`text-sm ${
                          isDark
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        View Details
                      </button>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4
                        className={`text-sm font-medium mb-3 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Products ({order.items?.length || 0})
                      </h4>

                      <div className="space-y-4">
                        {order.items?.map((item) => {
                          const product = products.find(
                            (p) => p.id === item.productId
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-4"
                            >
                              <div className="flex-shrink-0">
                                {product?.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-16 h-16 rounded flex items-center justify-center ${
                                      isDark ? "bg-gray-600" : "bg-gray-200"
                                    }`}
                                  >
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      No Image
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-sm font-medium truncate ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {product?.productName || "Product not found"}
                                </h4>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Quantity: {item.quantity}
                                </p>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Price: ${item.price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-medium ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="flex justify-between py-1">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Subtotal
                        </span>
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          ${order.subtotalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Shipping
                        </span>
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          ${order.shippingCost?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Tax
                        </span>
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          ${order.taxAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                        <span
                          className={`font-medium ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Total
                        </span>
                        <span
                          className={`font-medium ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          ${order.totalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div
            className={`rounded-lg shadow-sm p-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-lg font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Saved Addresses
              </h2>
              <button
                onClick={handleOpenAddAddress}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <FaPlus className="mr-2" />
                Add New Address
              </button>
            </div>

            {loading.addresses ? (
              <LoadingSpinner />
            ) : error.addresses ? (
              <div
                className={`p-4 rounded-md ${
                  isDark ? "bg-gray-700" : "bg-red-50"
                } text-red-500`}
              >
                {error.addresses}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className={`${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } mb-4`}
                >
                  No addresses found
                </p>
                <button
                  onClick={handleOpenAddAddress}
                  className={`px-4 py-2 rounded-md text-white ${
                    isDark
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "border-gray-700 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{address.name}</h3>
                      {address.type && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isDark
                              ? "bg-gray-600 text-gray-200"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {address.type.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1">{address.street}</p>
                    <p className="text-sm mb-1">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm mb-1">{address.country}</p>
                    <p className="text-sm mb-3">Phone: {address.phone}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEditAddress(address)}
                        className={`text-sm ${
                          isDark
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={loading.deleting}
                        className={`text-sm ${
                          isDark
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-800"
                        } ${
                          loading.deleting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {loading.deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Transition appear show={isAddressModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleCloseAddressModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </Dialog.Title>

                  <AddressForm
                    onAddressAdded={handleAddressSubmitSuccess}
                    onAddressUpdated={handleAddressSubmitSuccess}
                    refreshAddresses={handleAddressSubmitSuccess}
                    initialData={editingAddress}
                    onClose={handleCloseAddressModal}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserProfile;
