import React, { useState } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../context/CartContext";
import ThemeContext from "../../context/ThemeContext";
import { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegistrationForm = ({
  showRegistrationModal,
  onClose,
  onSwitchToLogin,
}) => {
  const { isDark } = useContext(ThemeContext);
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string(),
    userName: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      // Automatically log in the user after registration
      const { user: userData } = await login({
        userName: values.userName,
        password: values.password,
      });

      await fetchCart();
      toast.success("Registration successful! You are now logged in.");
      setTimeout(onClose, 1000);
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={showRegistrationModal}
      size="md"
      onClose={onClose}
      popup
      className={`${isDark ? "bg-gray-800" : "bg-white"}`}
    >
      <Modal.Header 
        className={`${isDark ? "bg-gray-800" : "bg-white"} p-4 text-xl font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Create a new account
      </Modal.Header>
      <Modal.Body className={`${isDark ? "bg-gray-800" : "bg-white"} p-6`}>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-4">
              {errors.submit && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" value="First Name *" />
                  <Field
                    as={TextInput}
                    id="firstName"
                    name="firstName"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" value="Last Name" />
                  <Field
                    as={TextInput}
                    id="lastName"
                    name="lastName"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="userName" value="Username *" />
                <Field
                  as={TextInput}
                  id="userName"
                  name="userName"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="userName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" value="Email *" />
                <Field
                  as={TextInput}
                  id="email"
                  name="email"
                  type="email"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" value="Phone Number *" />
                <Field
                  as={TextInput}
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  disabled={isSubmitting}
                />
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" value="Password *" />
                <div className="relative">
                  <Field
                    as={TextInput}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
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

              <div>
                <Label htmlFor="confirmPassword" value="Confirm Password *" />
                <div className="relative">
                  <Field
                    as={TextInput}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <Spinner aria-label="Loading" size="sm" />
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToLogin();
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Login here
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default RegistrationForm;
