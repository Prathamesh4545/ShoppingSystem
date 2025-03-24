import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Alert,
  Modal,
  Spinner,
  TextInput,
  Label,
  Select,
} from "flowbite-react";
import {
  FaMapMarkerAlt,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import EditProfileForm from "./EditProfile";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const UserProfile = () => {
  const { isDark } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const { deleteUser } = useUser();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch user addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) {
        setError("User not authenticated. Please log in again.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        logout();
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/address/user/${user.id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setAddresses(data);
      } catch (error) {
        setError("Failed to fetch addresses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, logout, navigate]);

  // Formik setup for address form
  const addressFormik = useFormik({
    initialValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      type: "SHIPPING",
    },
    validationSchema: Yup.object({
      street: Yup.string().required("Street is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("Zip code is required"),
      country: Yup.string().required("Country is required"),
      type: Yup.string().required("Address type is required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, userId: user.id }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error("Failed to add address");
        }

        const data = await response.json();
        setAddresses([...addresses, data]);
        setShowAddressModal(false);
        setSuccess("Address added successfully!");
      } catch (err) {
        setError(err.message);
      }
    },
  });

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      try {
        await deleteUser(user.id);
        logout();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle add address button click
  const handleAddAddress = () => {
    setShowAddressModal(true);
    setEditingAddress(null);
  };

  // Handle edit profile button click
  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  // Handle edit address button click
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  // Handle update address
  const handleUpdateAddress = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/address/${editingAddress.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate("/login");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to update address");
      }

      const data = await response.json();
      setAddresses(
        addresses.map((addr) => (addr.id === data.id ? data : addr))
      );
      setShowAddressModal(false);
      setSuccess("Address updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className={`pt-20 min-h-screen py-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className={`rounded-lg shadow-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
              <img
                src={
                  user?.imageUrl
                    ? `http://localhost:8080/uploads/${user.imageUrl}`
                    : "/default-profile.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/default-profile.png"; // Fallback to default image if the image fails to load
                }}
              />
            </div>
            {/* User Details */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
            <p className="text-gray-600 dark:text-gray-300">
              {user?.phoneNumber}
            </p>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Addresses
            </h3>
            <Button onClick={handleAddAddress} color="blue">
              <FaPlus className="mr-2" /> Add Address
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Spinner size="xl" />
            </div>
          ) : addresses.length > 0 ? (
            addresses.map((address) => (
              <Card key={address.id} className="mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-300">
                      <FaMapMarkerAlt className="inline-block mr-2" />
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.zipCode}, {address.country}
                    </p>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-300">
                      Type:{" "}
                      {address.type.charAt(0) +
                        address.type.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <Button
                    color="gray"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                  >
                    <FaEdit className="mr-2" /> Edit
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No addresses found.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button onClick={handleEditProfile} color="blue">
            <FaEdit className="mr-2" /> Edit Profile
          </Button>
          <Button onClick={handleDeleteProfile} color="red">
            <FaTrash className="mr-2" /> Delete Profile
          </Button>
          <Button onClick={handleLogout} color="gray">
            <FaSignOutAlt className="mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="fixed bottom-4 right-4">
          <Alert color="failure">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="fixed bottom-4 right-4">
          <Alert color="success">{success}</Alert>
        </div>
      )}

      {/* Address Modal */}
      <Modal show={showAddressModal} onClose={() => setShowAddressModal(false)}>
        <Modal.Header>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={
              editingAddress
                ? (e) => {
                    e.preventDefault();
                    handleUpdateAddress({
                      street: editingAddress.street,
                      city: editingAddress.city,
                      state: editingAddress.state,
                      zipCode: editingAddress.zipCode,
                      country: editingAddress.country,
                      type: editingAddress.type,
                    });
                  }
                : addressFormik.handleSubmit
            }
            className="space-y-4"
          >
            {/* Form fields for address */}
            {/* Street */}
            <div>
              <Label htmlFor="street" value="Street" />
              <TextInput
                id="street"
                name="street"
                type="text"
                value={
                  editingAddress
                    ? editingAddress.street
                    : addressFormik.values.street
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          street: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              />
              {addressFormik.touched.street && addressFormik.errors.street && (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.street}
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city" value="City" />
              <TextInput
                id="city"
                name="city"
                type="text"
                value={
                  editingAddress
                    ? editingAddress.city
                    : addressFormik.values.city
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          city: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              />
              {addressFormik.touched.city && addressFormik.errors.city ? (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.city}
                </div>
              ) : null}
            </div>

            {/* State */}
            <div>
              <Label htmlFor="state" value="State" />
              <TextInput
                id="state"
                name="state"
                type="text"
                value={
                  editingAddress
                    ? editingAddress.state
                    : addressFormik.values.state
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          state: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              />
              {addressFormik.touched.state && addressFormik.errors.state ? (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.state}
                </div>
              ) : null}
            </div>

            {/* Zip Code */}
            <div>
              <Label htmlFor="zipCode" value="Zip Code" />
              <TextInput
                id="zipCode"
                name="zipCode"
                type="text"
                value={
                  editingAddress
                    ? editingAddress.zipCode
                    : addressFormik.values.zipCode
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          zipCode: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              />
              {addressFormik.touched.zipCode && addressFormik.errors.zipCode ? (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.zipCode}
                </div>
              ) : null}
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country" value="Country" />
              <TextInput
                id="country"
                name="country"
                type="text"
                value={
                  editingAddress
                    ? editingAddress.country
                    : addressFormik.values.country
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          country: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              />
              {addressFormik.touched.country && addressFormik.errors.country ? (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.country}
                </div>
              ) : null}
            </div>

            {/* Address Type */}
            <div>
              <Label htmlFor="type" value="Address Type" />
              <Select
                id="type"
                name="type"
                value={
                  editingAddress
                    ? editingAddress.type
                    : addressFormik.values.type
                }
                onChange={
                  editingAddress
                    ? (e) =>
                        setEditingAddress({
                          ...editingAddress,
                          type: e.target.value,
                        })
                    : addressFormik.handleChange
                }
                onBlur={addressFormik.handleBlur}
              >
                <option value="SHIPPING">Shipping</option>
                <option value="BILLING">Billing</option>
              </Select>
              {addressFormik.touched.type && addressFormik.errors.type ? (
                <div className="text-red-500 text-sm">
                  {addressFormik.errors.type}
                </div>
              ) : null}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              {editingAddress ? "Update Address" : "Save Address"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        show={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      >
        <Modal.Header>Edit Profile</Modal.Header>
        <Modal.Body>
          <EditProfileForm
            user={user}
            onClose={() => setShowEditProfileModal(false)}
            onSuccess={(message) => setSuccess(message)}
            onError={(message) => setError(message)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserProfile;
