import React, { useState } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";

const RegistrationForm = ({ showRegistrationModal, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    // Validate Last Name
    if (formData.lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name contains invalid characters.";
    }

    // Validate Username
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(formData.userName)) {
      newErrors.userName = "Username must be 4-20 characters long and can only contain letters, numbers, and underscores.";
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Validate Password
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (
      !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one digit, one lowercase, one uppercase, and one special character.";
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Validate Phone Number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (
      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(""); // Reset previous messages

    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Show success message
      setMessage("Registration successful! You can now log in.");

      // Clear form data and close modal after success
      setFormData({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
      });

      setTimeout(onClose, 2000); // Close modal after 2 seconds

    } catch (error) {
      setErrors({ submit: error.message || "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={showRegistrationModal} size="md" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Create a new account
          </h3>

          {/* Global Success Message */}
          {message && (
            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
              {message}
            </div>
          )}

          {/* Global Submit Error Message */}
          {errors.submit && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
              {errors.submit}
            </div>
          )}

          {/* First Name */}
          <div>
            <Label htmlFor="firstName" value="First Name" />
            <TextInput
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              disabled={isLoading}
              aria-describedby="firstNameError"
            />
            {errors.firstName && (
              <p id="firstNameError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" value="Last Name" />
            <TextInput
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={isLoading}
              aria-describedby="lastNameError"
            />
            {errors.lastName && (
              <p id="lastNameError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="userName" value="Username" />
            <TextInput
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="johndoe123"
              required
              disabled={isLoading}
              aria-describedby="userNameError"
            />
            {errors.userName && (
              <p id="userNameError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.userName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              disabled={isLoading}
              aria-describedby="emailError"
            />
            {errors.email && (
              <p id="emailError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" value="Password" />
            <TextInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
              aria-describedby="passwordError"
            />
            {errors.password && (
              <p id="passwordError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" value="Confirm Password" />
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
              aria-describedby="confirmPasswordError"
            />
            {errors.confirmPassword && (
              <p id="confirmPasswordError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" value="Phone Number" />
            <TextInput
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              required
              disabled={isLoading}
              aria-describedby="phoneNumberError"
            />
            {errors.phoneNumber && (
              <p id="phoneNumberError" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner aria-label="Loading" size="sm" />
                  <span className="pl-3">Creating account...</span>
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <Button color="gray" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegistrationForm;