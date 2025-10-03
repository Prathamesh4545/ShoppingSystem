import React, { useState, useContext } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";
import { FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext"; 
import { useCart } from "../../context/CartContext";  
import ThemeContext from "../../context/ThemeContext";
import { useNotificationHandler } from "../../hooks/useNotificationHandler";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = ({ showLoginModal, onClose, onSwitchToRegister }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { isAuthenticated, logout, login } = useAuth();
  const { fetchCart } = useCart();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationHandler();

  const loginSchema = Yup.object().shape({
    userName: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting, setErrors }) => {
    try {
      const { user: userData } = await login(values);
      await fetchCart();
      
      const userName = userData.firstName || userData.userName || 'User';
      showSuccess(`Welcome back, ${userName}!`);
      onClose();

      // Immediate redirect based on user role
      navigate(userData.roles.includes("ADMIN") 
        ? "/admin/dashboard" 
        : "/", { replace: true }
      );
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Login failed. Please try again.";
      setErrors({ submit: errorMessage });
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={showLoginModal}
      size="md"
      onClose={onClose}
      popup
      className={`z-50 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <Modal.Header
        className={`border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } p-4`}
      >
        <div className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          {isAuthenticated ? "Your Profile" : "Login to your account"}
        </div>
      </Modal.Header>
      
      <Modal.Body className="p-6">
        {isAuthenticated ? (
          <div className="text-center space-y-6">
            <Button
              onClick={() => {
                logout();
                showSuccess("Logged out successfully");
                onClose();
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Formik
            initialValues={{ userName: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, errors }) => (
              <Form className="space-y-6">
                {errors.submit && (
                  <div className="flex items-center bg-red-50 p-4 rounded-lg text-red-700">
                    <FaExclamationCircle className="mr-2 text-xl" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="userName"
                    value="Username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  />
                  <Field
                    as={TextInput}
                    id="userName"
                    name="userName"
                    placeholder="Enter your username"
                    className="w-full"
                    disabled={isSubmitting}
                    autoComplete="username"
                  />
                  <ErrorMessage
                    name="userName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    value="Password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  />
                  <div className="relative">
                    <Field
                      as={TextInput}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full"
                      disabled={isSubmitting}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Login"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister();
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Register here
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginForm;