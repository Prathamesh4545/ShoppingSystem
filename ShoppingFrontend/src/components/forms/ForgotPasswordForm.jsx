import React, { useState } from "react";
import axios from "axios";
import { Label, TextInput, Button, Spinner } from "flowbite-react";

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/forgot-password`,
        { email }
      );

      if (response.data?.success) {
        alert("Password reset instructions sent to your email.");
        onSwitchToLogin();
      }
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.message ||
          "An error occurred. Please try again later.",
      });
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          color={errors.email ? "failure" : "gray"}
          helperText={
            errors.email && <span className="text-red-500">{errors.email}</span>
          }
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
        >
          Log in
        </button>
      </div>

      {errors.submit && (
        <p className="text-red-500 text-sm text-center">{errors.submit}</p>
      )}
    </form>
  );
};

export default ForgotPasswordForm;