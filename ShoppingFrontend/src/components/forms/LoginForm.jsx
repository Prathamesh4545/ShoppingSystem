import React, { useState, useEffect } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";
import { useAuth } from "../../context/AuthContext";
import { FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = ({ showLoginModal, onClose, onSwitchToRegister }) => {
  const { isAuthenticated, logout, login } = useAuth();
  const [formData, setFormData] = useState({ userName: "", password: "" });
  const [showPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showLoginModal) {
      setFormData({ userName: "", password: "" });
      setError(null);
    }
  }, [showLoginModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate input
      if (!formData.userName || !formData.password) {
        throw new Error("Username and password are required.");
      }

      // Use AuthContext's login function
      const { user: userData } = await login(formData);

      // Navigate based on role
      navigate(userData.roles.includes("ADMIN") ? "/admin/dashboard" : "/");
      toast.success("Login successful!");
      onClose();
    } catch (err) {
      console.error("Login error:", err); // Debugging: Log the error
      setError(err.message);
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showLoginModal} size="md" onClose={onClose} popup className="z-50">
      <Modal.Header className="border-b border-gray-200 p-4">
        <div className="text-xl font-semibold text-gray-800">
          {isAuthenticated ? "Your Profile" : "Login to your account"}
        </div>
      </Modal.Header>

      <Modal.Body className="p-6">
        {isAuthenticated ? (
          <div className="text-center space-y-6">
            <Button onClick={logout} className="w-full bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center bg-red-50 p-4 rounded-lg text-red-700">
                <FaExclamationCircle className="mr-2 text-xl" />
                <span>{error || "Login failed. Please try again."}</span>
              </div>
            )}

            <div>
              <Label htmlFor="userName" value="Username" className="block text-sm font-medium text-gray-700 mb-1" />
              <TextInput
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className="w-full"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password" value="Password" className="block text-sm font-medium text-gray-700 mb-1" />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <Spinner size="sm" /> : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-blue-600 hover:underline"
              >
                Register here
              </button>
            </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginForm;