import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Button, TextInput, Label, Alert, Spinner } from "flowbite-react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaImage } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, updateUser, logout } = useContext(AuthContext); // Use useContext to access AuthContext
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(user?.imageUrl || "/default-profile.png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formik setup with Yup validation
  const formik = useFormik({
    initialValues: {
      userName: user?.userName || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      password: "",
      imageUrl: user?.imageUrl || "",
    },
    validationSchema: Yup.object({
      userName: Yup.string().required("Username is required"),
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      phoneNumber: Yup.string()
        .matches(/^[0-9]+$/, "Phone number must be numeric")
        .required("Phone number is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!user?.id) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("userName", values.userName);
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("password", values.password || "");
        if (values.imageUrl instanceof File) {
          formData.append("imageUrl", values.imageUrl);
        }

        const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          const data = await response.json();
          throw new Error(data.message || "Failed to update profile");
        }

        const data = await response.json();
        updateUser(data); // Call updateUser to update the user context
        setSuccess("Profile updated successfully!");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file));
      formik.setFieldValue("imageUrl", file);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Edit Profile</h2>

        {error && <Alert color="failure">{error}</Alert>}
        {success && <Alert color="success">{success}</Alert>}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Profile Picture */}
          <div className="text-center">
            <img
              src={imagePreview}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-200 dark:border-gray-600"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="imageUpload"
            />
            <Button
              type="button"
              onClick={() => document.getElementById("imageUpload").click()}
              className="w-full"
            >
              <FaImage className="mr-2" /> Change Profile Picture
            </Button>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="userName" value="Username" />
            <TextInput
              id="userName"
              name="userName"
              type="text"
              value={formik.values.userName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaUser}
              required
            />
            {formik.touched.userName && formik.errors.userName && (
              <div className="text-red-500 text-sm">{formik.errors.userName}</div>
            )}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="firstName" value="First Name" />
            <TextInput
              id="firstName"
              name="firstName"
              type="text"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaUser}
              required
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className="text-red-500 text-sm">{formik.errors.firstName}</div>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" value="Last Name" />
            <TextInput
              id="lastName"
              name="lastName"
              type="text"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaUser}
              required
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className="text-red-500 text-sm">{formik.errors.lastName}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaEnvelope}
              required
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" value="Phone Number" />
            <TextInput
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaPhone}
              required
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-500 text-sm">{formik.errors.phoneNumber}</div>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" value="New Password (Optional)" />
            <TextInput
              id="password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              icon={FaLock}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm">{formik.errors.password}</div>
            )}
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