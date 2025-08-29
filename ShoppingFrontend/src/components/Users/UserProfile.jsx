import { useState, useEffect, Fragment, useContext } from "react";
import { useUser } from "../../context/UserContext";
import { DataContext } from "../../context/ProductContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../../context/ThemeContext";
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
  const { isDarkMode } = useContext(ThemeContext);
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
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
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
      className={`pt-16 min-h-screen ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div
          className={`rounded-xl shadow-lg p-6 mb-6 backdrop-blur-md border ${
            isDarkMode 
              ? "bg-white/10 border-white/20 shadow-2xl" 
              : "bg-white/70 border-white/30 shadow-xl"
          }`}
        >
          <div className="flex items-center justify-between">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              My Account
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center ${
                  isDarkMode
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
          className={`rounded-xl shadow-lg mb-6 backdrop-blur-md border ${
            isDarkMode 
              ? "bg-white/10 border-white/20 shadow-2xl" 
              : "bg-white/70 border-white/30 shadow-xl"
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
                        isDarkMode
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
            className={`rounded-xl shadow-lg p-6 backdrop-blur-md border ${
              isDarkMode 
                ? "bg-white/10 border-white/20 shadow-2xl" 
                : "bg-white/70 border-white/30 shadow-xl"
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
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-4xl ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
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
                    isDarkMode ? "text-gray-400" : "text-gray-500"
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full px-4 py-2 rounded-lg border ${
                        !isEditing
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                          : isDarkMode
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
                      isDarkMode
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
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } ${
                      loading.submitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading.submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Orders and Addresses tabs with simplified styling */}
        {activeTab === "orders" && (
          <div className={`rounded-xl shadow-lg p-6 backdrop-blur-md border ${
            isDarkMode ? "bg-white/10 border-white/20 shadow-2xl" : "bg-white/70 border-white/30 shadow-xl"
          }`}>
            <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Order History
            </h2>
            <p className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No orders found
            </p>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className={`rounded-xl shadow-lg p-6 backdrop-blur-md border ${
            isDarkMode ? "bg-white/10 border-white/20 shadow-2xl" : "bg-white/70 border-white/30 shadow-xl"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Saved Addresses
              </h2>
              <button
                onClick={handleOpenAddAddress}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <FaPlus className="mr-2" />
                Add New Address
              </button>
            </div>
            <p className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No addresses found
            </p>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Transition appear show={isAddressModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseAddressModal}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
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