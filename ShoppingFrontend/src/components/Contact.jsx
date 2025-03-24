import React, { useState } from "react";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Contact = () => {
  const [agreed, setAgreed] = useState(false);
  const { isDark } = useContext(ThemeContext);
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

  // Handle form input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (!formData.message) newErrors.message = "Message is required.";
    if (!agreed) newErrors.agreed = "You must agree to the privacy policy.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      // Handle successful form submission
      console.log("Form submitted successfully", formData);
      setFormSubmitted(true);
      // Reset form if necessary
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phoneNumber: "",
        message: "",
      });
    }
  };

  return (
    <div className={`isolate ${isDark ? 'bg-gray-900' : 'bg-white'} px-6 py-24 sm:py-32 lg:px-8`}>

      {formSubmitted && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          <p>Thank you! Your message has been sent.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="block text-sm font-semibold text-gray-900">
              First name
            </label>
            <div className="mt-2.5">
              <input
                id="first-name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="last-name" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Last name
            </label>
            <div className="mt-2.5">
              <input
                id="last-name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`block w-full rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3.5 py-2 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600`}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="company" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Company (optional)
            </label>
            <div className="mt-2.5">
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className={`block w-full rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3.5 py-2 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600`}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Email
            </label>
            <div className="mt-2.5">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3.5 py-2 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phone-number" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Phone number
            </label>
            <div className="mt-2.5">
              <input
                id="phone-number"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`block w-full rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3.5 py-2 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="message" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Message
            </label>
            <div className="mt-2.5">
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className={`block w-full rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3.5 py-2 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600`}
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            </div>
          </div>

          <div className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`${
                  agreed ? "bg-indigo-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
              >
                <span className="sr-only">Agree to policies</span>
                <span
                  aria-hidden="true"
                  className={`${
                    agreed ? "translate-x-5" : "translate-x-0"
                  } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <label className="text-sm text-gray-600">
              By selecting this, you agree to our{" "}
              <a href="#" className="font-semibold text-indigo-600">
                privacy policy
              </a>
              .
            </label>
            {errors.agreed && <p className="text-red-500 text-sm">{errors.agreed}</p>}
          </div>
        </div>

        <div className="mt-10">
          <button
            type="submit"
            disabled={!agreed}
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300"
          >
            Let's talk
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
