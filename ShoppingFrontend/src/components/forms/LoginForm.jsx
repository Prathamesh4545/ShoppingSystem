import React, { useState, useEffect } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";
import { useAuth } from "../../context/AuthContext";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUserCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const LoginPage = ({ showLoginModal, onClose, onSwitchToRegister }) => {
  const { login, logout, user, error, isLoading } = useAuth();
  const [formData, setFormData] = useState({ userName: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [errors, setErrors] = useState({});

  const LOGIN_STATUS = {
    SUCCESS: "success",
    FAILURE: "failure",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoginStatus("");

    if (!validateForm()) return;

    try {
      await login(formData.userName, formData.password);
      setLoginStatus(LOGIN_STATUS.SUCCESS);
      setFormData({ userName: "", password: "" });
    } catch (loginError) {
      setLoginStatus(LOGIN_STATUS.FAILURE);
      setErrors({
        submit: loginError.message || "Login failed. Please try again.",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFocus = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (error) {
      setLoginStatus(LOGIN_STATUS.FAILURE);
      setErrors({ submit: error });
    }
  }, [error]);

  useEffect(() => {
    if (!showLoginModal) {
      setLoginStatus("");
      setFormData({ userName: "", password: "" });
      setErrors({});
    }
  }, [showLoginModal]);

  const handleLogout = async () => {
    try {
      await logout();
      setLoginStatus("");
      onClose();
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      setErrors({ submit: "An error occurred while logging out." });
    }
  };

  return (
    <Modal show={showLoginModal} size="md" onClose={onClose} popup>
      <Modal.Header className="border-b border-gray-200 p-4">
        {user ? (
          <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
        ) : loginStatus === LOGIN_STATUS.SUCCESS ? (
          <h3 className="text-xl font-semibold text-gray-800">
            Login Successful!
          </h3>
        ) : (
          <h3 className="text-xl font-semibold text-gray-800">
            Login to your account
          </h3>
        )}
      </Modal.Header>

      <Modal.Body className="p-6">
        {user ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <FaUserCircle className="text-6xl text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-800">
                {user.userName}
              </h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Logout
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {loginStatus === LOGIN_STATUS.SUCCESS && (
              <div className="flex items-center bg-green-50 p-4 rounded-lg text-green-700">
                <FaCheckCircle className="mr-2 text-xl" />
                <span>Your login was successful!</span>
              </div>
            )}

            {loginStatus === LOGIN_STATUS.FAILURE && (
              <div className="flex items-center bg-red-50 p-4 rounded-lg text-red-700">
                <FaExclamationCircle className="mr-2 text-xl" />
                <span>
                  {errors.submit || "Login failed. Please try again."}
                </span>
              </div>
            )}

            <div>
              <Label
                htmlFor="userName"
                value="Username"
                className="block text-sm font-medium text-gray-700 mb-1"
              />
              <TextInput
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                aria-invalid={!!errors.userName}
                aria-describedby="userName-error"
                onFocus={() => handleFocus("userName")}
                disabled={isLoading || loginStatus !== ""}
                className="w-full"
                autoFocus
              />
              {errors.userName && (
                <p
                  id="userName-error"
                  className="text-red-500 text-sm mt-1"
                  aria-live="polite"
                >
                  {errors.userName}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="password"
                value="Password"
                className="block text-sm font-medium text-gray-700 mb-1"
              />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  onFocus={() => handleFocus("password")}
                  disabled={isLoading || loginStatus !== ""}
                  className="w-full"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || loginStatus !== ""}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-red-500 text-sm mt-1"
                  aria-live="polite"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="w-full">
              <Button
                type="submit"
                disabled={isLoading || loginStatus !== ""}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : loginStatus === LOGIN_STATUS.SUCCESS ? (
                  "Success!"
                ) : (
                  "Login"
                )}
              </Button>
            </div>

            {loginStatus !== LOGIN_STATUS.SUCCESS && (
              <div className="text-center text-sm text-gray-600">
                Not registered?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline focus:outline-none"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  disabled={isLoading}
                >
                  Create account
                </button>
              </div>
            )}
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginPage;