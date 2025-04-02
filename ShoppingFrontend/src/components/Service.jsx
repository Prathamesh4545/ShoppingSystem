import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FaPhoneAlt, FaTruck, FaUndo, FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const ServicePage = () => {
  const theme = useTheme();
  const { isDark, colors, spacing, typography, borderRadius, shadows, transitions } = theme;

  // Transition durations in seconds for Framer Motion
  const transitionDurations = {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35
  };

  // Background and text colors based on theme
  const bgColor = isDark ? colors.background.dark.primary : colors.background.light.primary;
  const cardBgColor = isDark ? colors.background.dark.secondary : colors.background.light.secondary;
  const cardHoverBgColor = isDark ? colors.background.dark.tertiary : colors.background.light.tertiary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
  const textColorSecondary = isDark ? colors.text.dark.secondary : colors.text.light.secondary;

  const services = [
    {
      icon: <FaPhoneAlt size={32} color={colors.primary.DEFAULT} />,
      title: "Customer Support",
      description: "We are here to help with any questions or concerns you have.",
      buttonText: "Contact Support",
      buttonColor: colors.primary.DEFAULT,
      delay: 0.1
    },
    {
      icon: <FaTruck size={32} color={colors.success.DEFAULT} />,
      title: "Delivery Information",
      description: "Fast and reliable shipping to ensure your orders arrive on time.",
      buttonText: "Track Order",
      buttonColor: colors.success.DEFAULT,
      delay: 0.2
    },
    {
      icon: <FaUndo size={32} color={colors.warning.DEFAULT} />,
      title: "Return Policy",
      description: "No worries! We offer a hassle-free return process if you change your mind.",
      buttonText: "Learn More",
      buttonColor: colors.warning.DEFAULT,
      delay: 0.3
    },
    {
      icon: <FaQuestionCircle size={32} color={colors.secondary.DEFAULT} />,
      title: "Frequently Asked Questions",
      description: "Get answers to the most common questions about our products and services.",
      buttonText: "View FAQs",
      buttonColor: colors.secondary.DEFAULT,
      delay: 0.4
    }
  ];

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
              Our Services
            </h1>
            <p 
              style={{
                marginTop: spacing.md,
                fontSize: typography.fontSize.lg,
                color: textColorSecondary
              }}
            >
              Learn more about what we offer and how we can help you!
            </p>
          </motion.div>

          {/* Service Cards */}
          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: spacing.lg
            }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: transitionDurations.normal, delay: service.delay }}
                whileHover={{ scale: 1.05 }}
                style={{
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  boxShadow: shadows.md,
                  backgroundColor: cardBgColor,
                  transition: transitions.normal
                }}
              >
                <div 
                  style={{
                    textAlign: "center",
                    marginBottom: spacing.md
                  }}
                >
                  <div style={{ marginBottom: spacing.sm }}>{service.icon}</div>
                  <h3 
                    style={{
                      fontSize: typography.fontSize.xl,
                      fontWeight: typography.fontWeight.semibold,
                      color: textColor
                    }}
                  >
                    {service.title}
                  </h3>
                  <p 
                    style={{
                      marginTop: spacing.sm,
                      color: textColorSecondary
                    }}
                  >
                    {service.description}
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: service.buttonColor,
                    color: "#FFFFFF",
                    borderRadius: borderRadius.md,
                    fontWeight: typography.fontWeight.medium,
                    border: "none",
                    cursor: "pointer",
                    transition: transitions.fast
                  }}
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