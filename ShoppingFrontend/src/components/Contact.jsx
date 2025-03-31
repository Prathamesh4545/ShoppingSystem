import React, { useState } from "react";
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const Contact = () => {
  const [agreed, setAgreed] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number.";
    }
    if (!formData.message) newErrors.message = "Message is required.";
    if (!agreed) newErrors.agreed = "You must agree to the privacy policy.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormSubmitted(true);
        setFormData({
          firstName: "",
          lastName: "",
          company: "",
          email: "",
          phoneNumber: "",
          message: "",
        });
        setAgreed(false);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderInput = (name, label, type = "text", icon, placeholder) => (
    <div className="relative">
      <label
        htmlFor={name}
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          {icon}
        </div>
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            rows={4}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
          />
        )}
      </div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500 flex items-center"
          >
            <FaExclamationCircle className="mr-1" />
            {errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`min-h-screen py-20 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`shadow-lg rounded-lg p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        >
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Contact Us
            </h1>
            <p className={`mt-4 text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <AnimatePresence>
            {formSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center"
              >
                <FaCheckCircle className="mr-2" />
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput(
                "firstName",
                "First Name",
                "text",
                <FaUser className="h-5 w-5" />,
                "Enter your first name"
              )}
              {renderInput(
                "lastName",
                "Last Name",
                "text",
                <FaUser className="h-5 w-5" />,
                "Enter your last name"
              )}
            </div>

            {renderInput(
              "company",
              "Company (Optional)",
              "text",
              <FaBuilding className="h-5 w-5" />,
              "Enter your company name"
            )}

            {renderInput(
              "email",
              "Email",
              "email",
              <FaEnvelope className="h-5 w-5" />,
              "Enter your email address"
            )}

            {renderInput(
              "phoneNumber",
              "Phone Number",
              "tel",
              <FaPhone className="h-5 w-5" />,
              "Enter your phone number"
            )}

            {renderInput(
              "message",
              "Message",
              "textarea",
              <FaPaperPlane className="h-5 w-5" />,
              "Enter your message"
            )}

            <div className="flex items-start space-x-3">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-1 flex-shrink-0 h-5 w-5 rounded border ${
                  agreed
                    ? "bg-blue-500 border-blue-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200`}
              >
                {agreed && (
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <div className="text-sm">
                <label
                  htmlFor="agreement"
                  className={`font-medium ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    privacy policy
                  </a>
                </label>
                {errors.agreed && (
                  <p className="mt-1 text-red-500 text-sm">{errors.agreed}</p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !agreed}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-6 rounded-lg text-white font-medium flex items-center justify-center space-x-2 ${
                isSubmitting || !agreed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } transition-colors duration-200`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
