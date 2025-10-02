import React, { useState, useContext } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
              Frequently Asked Questions
            </h1>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Find answers to the most common questions about our services and policies.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <CategoryButton 
              label="All" 
              isActive={selectedCategory === 'all'} 
              onClick={() => setSelectedCategory('all')}
              isDarkMode={isDarkMode}
            />
            
            {categories.map(category => (
              <CategoryButton 
                key={category} 
                label={category} 
                isActive={selectedCategory === category} 
                onClick={() => setSelectedCategory(category)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="flex flex-col gap-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`backdrop-blur-md border overflow-hidden rounded-lg ${
                    isDarkMode 
                      ? "bg-white/10 border-white/20 shadow-2xl" 
                      : "bg-white/70 border-white/30 shadow-xl"
                  }`}
                >
                  <motion.div
                    className={`flex justify-between items-center p-6 cursor-pointer transition-colors duration-200 ${
                      activeIndex === index 
                        ? (isDarkMode ? 'bg-white/5' : 'bg-black/5') 
                        : 'hover:bg-white/5 dark:hover:bg-white/5'
                    }`}
                    onClick={() => toggleQuestion(index)}
                  >
                    <h3 className={`text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeIndex === index ? (
                        <FaChevronUp className={`text-xl ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      ) : (
                        <FaChevronDown className={`text-xl ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
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
                        className={`px-6 pb-6 overflow-hidden leading-relaxed ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center p-8 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-800/50 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <FaQuestionCircle className={`text-5xl mx-auto mb-4 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <p className="text-lg">
                  No FAQs found in this category. Please try another category.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

// Category button component
const CategoryButton = ({ label, isActive, onClick, isDarkMode }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
          : isDarkMode
          ? 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700'
          : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100'
      }`}
    >
      {label}
    </motion.button>
  );
};

export default FAQPage;