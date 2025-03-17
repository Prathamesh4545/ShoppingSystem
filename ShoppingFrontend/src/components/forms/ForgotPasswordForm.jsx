import React, { useState } from "react";
import axios from "axios";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { isTokenExpired, logout } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" })); // Clear error when typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:8080/api/users/forgot-password`, { email });

      if (response.data?.success) {
        toast.success("Password reset instructions sent to your email.");
        onSwitchToLogin();
      } else {
        throw new Error(response.data.message || "Unexpected response from server.");
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email" value="Email" />
        <TextInput
          id="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          disabled={isLoading}
          color={errors.email ? "failure" : "gray"}
          helperText={errors.email && <span className="text-red-500">{errors.email}</span>}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Spinner aria-label="Sending..." size="sm" /> : "Send Reset Link"}
      </Button>

      <div className="text-sm text-gray-500">
        Remember your password?{" "}
        <button
          type="button"
          className="text-cyan-700 hover:underline"
          onClick={onSwitchToLogin}
          disabled={isLoading}
        >
          Log in
        </button>
      </div>

      {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
    </form>
  );
};

export default ForgotPasswordForm;