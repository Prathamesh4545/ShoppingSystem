import React, { useState, useContext } from "react";
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
  const { isDarkMode } = useContext(ThemeContext);
  
  const [agreed, setAgreed] = useState(false);
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
    <div>
      <label
        htmlFor={name}
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <div className={`absolute ${type === 'textarea' ? 'top-4' : 'top-1/2 -translate-y-1/2'} left-4 pointer-events-none ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
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
            className={`block w-full pl-12 pr-4 py-3 rounded-lg border resize-vertical text-base ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`block w-full pl-12 pr-4 py-3 rounded-lg border text-base ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        )}
      </div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
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
    <div
      className={`pt-16 min-h-screen ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`backdrop-blur-md border rounded-xl p-8 ${
            isDarkMode 
              ? "bg-white/10 border-white/20 shadow-2xl" 
              : "bg-white/70 border-white/30 shadow-xl"
          }`}
        >
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className={`text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Contact Us
            </h1>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <AnimatePresence>
            {formSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center"
              >
                <FaCheckCircle className="mr-2" />
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput(
                "firstName",
                "First Name",
                "text",
                <FaUser />,
                "Enter your first name"
              )}
              {renderInput(
                "lastName",
                "Last Name",
                "text",
                <FaUser />,
                "Enter your last name"
              )}
            </div>

            {renderInput(
              "company",
              "Company (Optional)",
              "text",
              <FaBuilding />,
              "Enter your company name"
            )}

            {renderInput(
              "email",
              "Email",
              "email",
              <FaEnvelope />,
              "Enter your email address"
            )}

            {renderInput(
              "phoneNumber",
              "Phone Number",
              "tel",
              <FaPhone />,
              "Enter your phone number"
            )}

            {renderInput(
              "message",
              "Message",
              "textarea",
              <FaPaperPlane />,
              "Enter your message"
            )}

            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-1 flex-shrink-0 h-5 w-5 rounded border cursor-pointer p-0 ${
                  agreed 
                    ? 'bg-blue-600 border-blue-600' 
                    : isDarkMode 
                    ? 'bg-transparent border-gray-600' 
                    : 'bg-transparent border-gray-300'
                }`}
              >
                {agreed && (
                  <svg
                    className="h-full w-full text-white"
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
              <div>
                <label
                  htmlFor="agreement"
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    privacy policy
                  </a>
                </label>
                {errors.agreed && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.agreed}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !agreed}
              whileHover={!isSubmitting && agreed ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && agreed ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15 }}
              className={`w-full px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 border-none transition-all duration-200 ${
                isSubmitting || !agreed 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
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

    </div>
  );
};

export default Contact;