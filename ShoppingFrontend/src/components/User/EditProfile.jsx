import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, TextInput, Label, Alert } from "flowbite-react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaImage } from "react-icons/fa";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    userName: user?.userName || "", // Add userName field
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    password: "",
    imageUrl: user?.imageUrl || "",
  });

  const [imagePreview, setImagePreview] = useState(user?.imageUrl || "/default-profile.png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: file }));
    } else {
      setError("Please upload a valid image file.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    // Check if user ID exists
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }
  
    // Check for valid token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("userName", formData.userName); // Add userName to form data
      formDataToSubmit.append("firstName", formData.firstName);
      formDataToSubmit.append("lastName", formData.lastName);
      formDataToSubmit.append("email", formData.email);
      formDataToSubmit.append("phoneNumber", formData.phoneNumber);
      formDataToSubmit.append("password", formData.password || "");
      if (formData.imageUrl instanceof File) {
        formDataToSubmit.append("imageUrl", formData.imageUrl);
      }

      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}` // Use the token variable
        },
        body: formDataToSubmit,
      });

   if (!response.ok) {
      if (response.status === 401) {
        logout(); // Force logout if token is invalid
        navigate("/login");
        throw new Error("Session expired. Please log in again.");
      }
      const data = await response.json();
      throw new Error(data.message || "Failed to update profile");
    }
      updateUser(data);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Edit Profile</h2>

        {error && <Alert color="failure">{error}</Alert>}
        {success && <Alert color="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture */}
          <div className="text-center">
            <img src={imagePreview} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-200 dark:border-gray-600" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="imageUpload" />
            <Button type="button" onClick={() => document.getElementById("imageUpload").click()} className="w-full">
              <FaImage className="mr-2" /> Change Profile Picture
            </Button>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="userName" value="Username" />
            <TextInput id="userName" name="userName" type="text" value={formData.userName} onChange={handleChange} icon={FaUser} required />
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="firstName" value="First Name" />
            <TextInput id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} icon={FaUser} required />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" value="Last Name" />
            <TextInput id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} icon={FaUser} required />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" name="email" type="email" value={formData.email} onChange={handleChange} icon={FaEnvelope} required />
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" value="Phone Number" />
            <TextInput id="phoneNumber" name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} icon={FaPhone} required />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" value="New Password (Optional)" />
            <TextInput id="password" name="password" type="password" value={formData.password} onChange={handleChange} icon={FaLock} />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;