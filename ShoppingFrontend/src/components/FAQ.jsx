import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'How do I place an order?',
      answer:
        'To place an order, simply browse our products, select the ones you wish to buy, and click "Add to Cart." Then, proceed to checkout to complete your order.',
      category: 'Ordering'
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept various payment methods including credit cards, debit cards, PayPal, and other secure online payment gateways.',
      category: 'Payment'
    },
    {
      question: 'How can I track my order?',
      answer:
        'Once your order has been shipped, you will receive a tracking number via email. You can use that tracking number to track the status of your shipment.',
      category: 'Shipping'
    },
    {
      question: 'Can I return or exchange an item?',
      answer:
        'Yes, we offer a 30-day return and exchange policy. Please ensure the items are in their original condition, with tags and packaging intact.',
      category: 'Returns'
    },
    {
      question: 'Do you offer free shipping?',
      answer:
        'We offer free shipping on orders over $50 within the continental United States. For international orders, shipping fees may apply.',
      category: 'Shipping'
    },
    {
      question: 'How do I contact customer support?',
      answer:
        'You can reach our customer support team through the "Contact Us" section of our website, or by calling our toll-free number listed on the bottom of the page.',
      category: 'Support'
    },
  ];

  const categories = [...new Set(faqData.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

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
              Frequently Asked Questions
            </h1>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Find answers to the most common questions about our services and policies.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                selectedCategory === 'all'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                  selectedCategory === category
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg shadow-md overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <motion.div
                  className={`flex justify-between items-center p-4 cursor-pointer ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                  } transition-colors duration-200`}
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeIndex === index ? (
                      <FaChevronUp className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    ) : (
                      <FaChevronDown className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    )}
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`px-4 pb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
