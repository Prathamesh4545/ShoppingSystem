import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
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
  const theme = useTheme();
  const { isDark, colors, spacing, typography, borderRadius, shadows, transitions } = theme;
  
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
  
  // Transition durations in seconds for Framer Motion
  const transitionDurations = {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35
  };
  
  // Theme-based colors
  const bgColor = isDark ? colors.background.dark.primary : colors.background.light.primary;
  const cardBgColor = isDark ? colors.background.dark.secondary : colors.background.light.secondary;
  const inputBgColor = isDark ? colors.background.dark.tertiary : colors.background.light.primary;
  const inputBorderColor = isDark ? 'transparent' : colors.text.light.tertiary;
  const textColor = isDark ? colors.text.dark.primary : colors.text.light.primary;
  const textColorSecondary = isDark ? colors.text.dark.secondary : colors.text.light.secondary;
  const placeholderColor = isDark ? colors.text.dark.tertiary : colors.text.light.tertiary;

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
        style={{
          display: "block",
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          marginBottom: spacing.sm,
          color: textColor
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div 
          style={{
            position: "absolute",
            top: "50%",
            left: spacing.md,
            transform: type === "textarea" ? "translateY(0)" : "translateY(-50%)",
            color: textColorSecondary,
            pointerEvents: "none",
            marginTop: type === "textarea" ? spacing.sm : 0
          }}
        >
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
            style={{
              display: "block",
              width: "100%",
              paddingLeft: spacing['2xl'],
              paddingRight: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: spacing.md,
              borderRadius: borderRadius.lg,
              border: `1px solid ${inputBorderColor}`,
              backgroundColor: inputBgColor,
              color: textColor,
              resize: "vertical",
              fontSize: typography.fontSize.base
            }}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            style={{
              display: "block",
              width: "100%",
              paddingLeft: spacing['2xl'],
              paddingRight: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: spacing.md,
              borderRadius: borderRadius.lg,
              border: `1px solid ${inputBorderColor}`,
              backgroundColor: inputBgColor,
              color: textColor,
              fontSize: typography.fontSize.base
            }}
          />
        )}
      </div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: transitionDurations.fast }}
            style={{
              marginTop: spacing.xs,
              fontSize: typography.fontSize.sm,
              color: colors.error.DEFAULT,
              display: "flex",
              alignItems: "center"
            }}
          >
            <FaExclamationCircle style={{ marginRight: spacing.xs }} />
            {errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

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
              Contact Us
            </h1>
            <p 
              style={{
                marginTop: spacing.md,
                fontSize: typography.fontSize.lg,
                color: textColorSecondary
              }}
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <AnimatePresence>
            {formSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: transitionDurations.normal }}
                style={{
                  marginBottom: spacing.lg,
                  padding: spacing.md,
                  backgroundColor: colors.success.light + '33', // Adding 33 for transparency
                  color: colors.success.dark,
                  borderRadius: borderRadius.lg,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FaCheckCircle style={{ marginRight: spacing.sm }} />
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
                gap: spacing.lg 
              }}
            >
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

            <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                style={{
                  marginTop: spacing.xs,
                  flexShrink: 0,
                  height: "20px",
                  width: "20px",
                  borderRadius: borderRadius.sm,
                  border: `1px solid ${isDark ? colors.text.dark.tertiary : colors.text.light.tertiary}`,
                  backgroundColor: agreed ? colors.primary.DEFAULT : 'transparent',
                  cursor: "pointer",
                  padding: 0
                }}
              >
                {agreed && (
                  <svg
                    style={{ height: "100%", width: "100%", color: "#FFFFFF" }}
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
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: textColor
                  }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    style={{
                      color: colors.primary.DEFAULT,
                      transition: transitions.fast
                    }}
                  >
                    privacy policy
                  </a>
                </label>
                {errors.agreed && (
                  <p 
                    style={{
                      marginTop: spacing.xs,
                      color: colors.error.DEFAULT,
                      fontSize: typography.fontSize.sm
                    }}
                  >
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
              transition={{ duration: transitionDurations.fast }}
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: borderRadius.lg,
                backgroundColor: isSubmitting || !agreed ? colors.text.light.tertiary : colors.primary.DEFAULT,
                color: "#FFFFFF",
                fontWeight: typography.fontWeight.medium,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.sm,
                cursor: isSubmitting || !agreed ? "not-allowed" : "pointer",
                border: "none",
                transition: transitions.normal
              }}
            >
              {isSubmitting ? (
                <>
                  <div 
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid #FFFFFF",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}
                  />
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
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;