import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const theme = useTheme();
  const { isDark, colors, spacing, typography, borderRadius, shadows, transitions } = theme;

  // Transition durations in seconds for Framer Motion
  const transitionDurations = {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35
  };
  
  // Theme-based colors
  const bgColor = isDark ? colors.background.dark.primary : colors.background.light.primary;
  const cardBgColor = isDark ? colors.background.dark.secondary : colors.background.light.secondary;
  const faqItemBgColor = isDark ? colors.background.dark.tertiary : colors.background.light.tertiary;
  const faqItemHoverBgColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
  const textColorSecondary = isDark ? colors.text.dark.secondary : colors.text.light.secondary;

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
      style={{
        minHeight: "100vh",
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['2xl'],
        backgroundColor: bgColor
      }}
    >
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: `0 ${spacing.md}`
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: transitionDurations.normal }}
          style={{
            boxShadow: shadows.lg,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            backgroundColor: cardBgColor
          }}
        >
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: transitionDurations.normal, delay: 0.2 }}
            style={{
              textAlign: "center",
              marginBottom: spacing['2xl']
            }}
          >
            <h1 
              style={{
                fontSize: typography.fontSize['4xl'],
                fontWeight: typography.fontWeight.bold,
                color: textColor
              }}
            >
              Frequently Asked Questions
            </h1>
            <p 
              style={{
                marginTop: spacing.md,
                fontSize: typography.fontSize.lg,
                color: textColorSecondary
              }}
            >
              Find answers to the most common questions about our services and policies.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div 
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: spacing.sm,
              marginBottom: spacing.xl
            }}
          >
            <CategoryButton 
              label="All" 
              isActive={selectedCategory === 'all'} 
              onClick={() => setSelectedCategory('all')}
              theme={theme}
            />
            
            {categories.map(category => (
              <CategoryButton 
                key={category} 
                label={category} 
                isActive={selectedCategory === category} 
                onClick={() => setSelectedCategory(category)}
                theme={theme}
              />
            ))}
          </div>

          {/* FAQ Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: transitionDurations.normal, delay: index * 0.1 }}
                  style={{
                    borderRadius: borderRadius.lg,
                    boxShadow: shadows.md,
                    overflow: "hidden",
                    backgroundColor: faqItemBgColor
                  }}
                >
                  <motion.div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: spacing.lg,
                      cursor: "pointer",
                      backgroundColor: activeIndex === index ? faqItemHoverBgColor : 'transparent',
                      transition: transitions.normal
                    }}
                    whileHover={{ backgroundColor: faqItemHoverBgColor }}
                    onClick={() => toggleQuestion(index)}
                  >
                    <h3 
                      style={{
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.semibold,
                        color: textColor
                      }}
                    >
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: transitionDurations.fast }}
                    >
                      {activeIndex === index ? (
                        <FaChevronUp style={{ fontSize: "1.25rem", color: colors.primary.DEFAULT }} />
                      ) : (
                        <FaChevronDown style={{ fontSize: "1.25rem", color: textColorSecondary }} />
                      )}
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: transitionDurations.normal }}
                        style={{
                          padding: `0 ${spacing.lg} ${spacing.lg} ${spacing.lg}`,
                          color: textColorSecondary,
                          lineHeight: 1.6,
                          overflow: "hidden"
                        }}
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
                style={{
                  textAlign: "center",
                  padding: spacing.xl,
                  backgroundColor: faqItemBgColor,
                  borderRadius: borderRadius.lg,
                  color: textColorSecondary
                }}
              >
                <FaQuestionCircle 
                  style={{ 
                    fontSize: "3rem", 
                    color: colors.primary.light,
                    display: "block",
                    margin: "0 auto",
                    marginBottom: spacing.md
                  }} 
                />
                <p style={{ fontSize: typography.fontSize.lg }}>
                  No FAQs found in this category. Please try another category.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Category button component
const CategoryButton = ({ label, isActive, onClick, theme }) => {
  const { isDark, colors, borderRadius, spacing, transitions } = theme;
  
  // Determine button colors based on theme and active state
  const buttonColor = isActive 
    ? colors.primary.DEFAULT 
    : 'transparent';
  
  const textColor = isActive 
    ? "#FFFFFF" 
    : isDark ? colors.text.dark.secondary : colors.text.light.secondary;
  
  const borderColor = isActive 
    ? colors.primary.DEFAULT 
    : isDark ? colors.text.dark.tertiary : colors.text.light.tertiary;
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{
        padding: `${spacing.xs} ${spacing.md}`,
        borderRadius: borderRadius.full,
        backgroundColor: buttonColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        transition: transitions.normal,
        cursor: "pointer",
        fontWeight: isActive ? "600" : "normal"
      }}
    >
      {label}
    </motion.button>
  );
};

export default FAQPage;