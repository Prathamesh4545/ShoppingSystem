import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaUser,
  FaHeart,
  FaQuestionCircle,
} from 'react-icons/fa';
import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

const Footer = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/products' },
      { name: 'New Arrivals', path: '/products?filter=new' },
      { name: 'Best Sellers', path: '/products?filter=bestsellers' },
      { name: 'Special Offers', path: '/products?filter=offers' },
    ],
    account: [
      { name: 'My Account', path: '/account' },
      { name: 'Orders', path: '/orders' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Settings', path: '/settings' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Shipping Policy', path: '/shipping' },
      { name: 'Returns Policy', path: '/returns' },
    ],
  };

  const socialLinks = [
    { icon: <FaFacebook />, url: 'https://facebook.com' },
    { icon: <FaTwitter />, url: 'https://twitter.com' },
    { icon: <FaInstagram />, url: 'https://instagram.com' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com' },
  ];

  const contactInfo = [
    { icon: <FaEnvelope />, text: 'support@shopping.com' },
    { icon: <FaPhone />, text: '+1 (555) 123-4567' },
    { icon: <FaMapMarkerAlt />, text: '123 Shopping Street, City, Country' },
  ];

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">About Us</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}>
              Your one-stop destination for all your shopping needs. We offer quality products
              at competitive prices with excellent customer service.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-700'
                  } hover:bg-blue-500 transition-colors duration-200`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`hover:text-blue-400 transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Account Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Account</h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`hover:text-blue-400 transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <span className="text-blue-400">{info.icon}</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-400'}>
                    {info.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`mt-12 pt-8 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-700'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}>
              © {new Date().getFullYear()} Shopping System. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className={`hover:text-blue-400 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className={`hover:text-blue-400 transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
