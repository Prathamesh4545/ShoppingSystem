import React from "react";
import { Button } from "flowbite-react";
import { FaPhoneAlt, FaTruck, FaUndo, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

const ServicePage = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const services = [
    {
      icon: <FaPhoneAlt className="text-4xl text-blue-500 mb-3" />,
      title: "Customer Support",
      description: "We are here to help with any questions or concerns you have.",
      buttonText: "Contact Support",
      color: "blue",
      delay: 0.1
    },
    {
      icon: <FaTruck className="text-4xl text-green-500 mb-3" />,
      title: "Delivery Information",
      description: "Fast and reliable shipping to ensure your orders arrive on time.",
      buttonText: "Track Order",
      color: "green",
      delay: 0.2
    },
    {
      icon: <FaUndo className="text-4xl text-yellow-500 mb-3" />,
      title: "Return Policy",
      description: "No worries! We offer a hassle-free return process if you change your mind.",
      buttonText: "Learn More",
      color: "yellow",
      delay: 0.3
    },
    {
      icon: <FaQuestionCircle className="text-4xl text-purple-500 mb-3" />,
      title: "Frequently Asked Questions",
      description: "Get answers to the most common questions about our products and services.",
      buttonText: "View FAQs",
      color: "purple",
      delay: 0.4
    }
  ];

  return (
    <div className={`min-h-screen py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`shadow-lg rounded-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Our Services
            </h1>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Learn more about what we offer and how we can help you!
            </p>
          </motion.div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: service.delay }}
                whileHover={{ scale: 1.05 }}
                className={`rounded-lg p-6 shadow-md ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-50'
                } transition-colors duration-300`}
              >
                <div className="text-center mb-4">
                  {service.icon}
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {service.title}
                  </h3>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                </div>
                <Button 
                  color={service.color} 
                  className="w-full transition-all duration-300 hover:scale-105"
                >
                  {service.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicePage;
