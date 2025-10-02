import React, { useContext } from "react";
import ThemeContext from "../context/ThemeContext";
import { FaPhoneAlt, FaTruck, FaUndo, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const ServicePage = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const services = [
    {
      icon: <FaPhoneAlt size={32} color="#3B82F6" />,
      title: "Customer Support",
      description: "We are here to help with any questions or concerns you have.",
      buttonText: "Contact Support",
      buttonColor: "#3B82F6",
      delay: 0.1
    },
    {
      icon: <FaTruck size={32} color="#10B981" />,
      title: "Delivery Information",
      description: "Fast and reliable shipping to ensure your orders arrive on time.",
      buttonText: "Track Order",
      buttonColor: "#10B981",
      delay: 0.2
    },
    {
      icon: <FaUndo size={32} color="#F59E0B" />,
      title: "Return Policy",
      description: "No worries! We offer a hassle-free return process if you change your mind.",
      buttonText: "Learn More",
      buttonColor: "#F59E0B",
      delay: 0.3
    },
    {
      icon: <FaQuestionCircle size={32} color="#8B5CF6" />,
      title: "Frequently Asked Questions",
      description: "Get answers to the most common questions about our products and services.",
      buttonText: "View FAQs",
      buttonColor: "#8B5CF6",
      delay: 0.4
    }
  ];

  return (
    <div
      className={`pt-16 min-h-screen ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Our{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Services
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Discover our comprehensive range of services designed to enhance your shopping experience.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl p-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: service.delay, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4">{service.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: service.buttonColor }}
                >
                  {service.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicePage;