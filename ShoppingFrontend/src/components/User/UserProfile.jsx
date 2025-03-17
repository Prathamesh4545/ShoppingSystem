import React, { useState, useEffect } from "react";
import { Button, Card, Alert } from "flowbite-react";
import { FaMapMarkerAlt, FaTrash, FaSignOutAlt } from "react-icons/fa"; // Added FaSignOutAlt for logout icon
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, logout } = useAuth(); // Destructure logout from useAuth
  const { deleteUser } = useUser();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user addresses on component mount
  useEffect(() => {
    console.log("User ID:", user?.id); // Debugging
    if (user?.id) {
      fetch(`http://localhost:8080/api/address/user/${user.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Addresses:", data); // Debugging
          setAddresses(data);
        })
        .catch((error) => {
          console.error("Error fetching addresses:", error);
          setError("Failed to fetch addresses. Please try again later.");
        });
    }
  }, [user]);

  console.log("Addresses State:", addresses); // Debugging

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      try {
        await deleteUser(user.id);
        logout(); // Logout after deleting the profile
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Navigate to edit profile page
  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100vh]">
      <div className="relative flex flex-col items-center rounded-[20px] w-[400px] mx-auto p-4 bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:!shadow-none">
        {/* Banner Image */}
        <div className="relative flex h-32 w-full justify-center rounded-xl bg-cover">
          <img
            src="https://horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app/static/media/banner.ef572d78f29b0fee0a09.png"
            className="absolute flex h-32 w-full justify-center rounded-xl bg-cover"
            alt="Banner"
          />
          {/* Profile Picture */}
          <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
            <img
              className="h-full w-full rounded-full"
              src={user?.imageUrl || "/default-profile.png"}
              alt="Profile"
            />
          </div>
        </div>

        {/* User Details */}
        <div className="mt-16 flex flex-col items-center">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {user?.firstName} {user?.lastName}
          </h4>
          <p className="text-base font-normal text-gray-600">{user?.email}</p>
          <p className="text-base font-normal text-gray-600">
            {user?.phoneNumber}
          </p>
          <p className="text-base font-normal text-gray-600">
            Role: {user?.role}
          </p>
        </div>

        {/* Addresses */}
        <div className="mt-6 w-full">
          <h5 className="text-lg font-semibold text-navy-700 dark:text-white">
            Addresses
          </h5>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              // Inside the addresses.map((address) => (...)) section:
              <Card key={address.id} className="mt-2">
                <p className="text-sm font-normal text-gray-600">
                  <FaMapMarkerAlt className="inline-block mr-2" />
                  {address.street}, {address.city}, {address.state},{" "}
                  {address.zipCode}, {address.country}
                </p>
                <p className="text-sm font-normal text-gray-600">
                  Type:{" "}
                  {address.type.charAt(0) + address.type.slice(1).toLowerCase()}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-600">No addresses found.</p>
          )}
        </div>

        {/* Edit Profile Button */}
        <Button
          onClick={handleEditProfile}
          className="w-full mt-6 text-white bg-blue-500 hover:bg-blue-600"
        >
          Edit Profile
        </Button>

        {/* Delete Profile Button */}
        <Button
          onClick={handleDeleteProfile}
          className="w-full mt-4 text-white bg-red-500 hover:bg-red-600"
        >
          <FaTrash className="mr-2" /> Delete Profile
        </Button>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full mt-4 text-white bg-gray-500 hover:bg-gray-600"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </Button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mt-4">
          <Alert color="failure">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Alert color="success">{success}</Alert>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
