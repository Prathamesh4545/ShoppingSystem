import React, { useState, useEffect } from "react";
import {
  FaPercent,
  FaCalendarAlt,
  FaClock,
  FaImage,
  FaTimes,
  FaChevronDown,
  FaCheck,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const DealForm = ({ deal, products, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    description: deal?.description || "",
    discountPercentage: deal?.discountPercentage || "",
    startDate: deal?.startDate || "",
    endDate: deal?.endDate || "",
    startTime: deal?.startTime || "00:00",
    endTime: deal?.endTime || "23:59",
    isActive: deal?.isActive ?? true,
    products: deal?.products || [],
    image: null,
    imagePreview: deal?.imageUrl || null,
  });

  const [errors, setErrors] = useState({});
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        description: deal.description,
        discountPercentage: deal.discountPercentage,
        startDate: format(new Date(deal.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(deal.endDate), "yyyy-MM-dd"),
        startTime: deal.startTime || "00:00",
        endTime: deal.endTime || "23:59",
        isActive: deal.isActive ?? true,
        products: deal.products || [],
        image: null,
        imagePreview: deal.imageUrl || null,
      });
    }
  }, [deal]);

  const filteredProducts = products?.filter((product) =>
    product.productName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProductSelection = (product) => {
    setFormData((prev) => {
      const isSelected = prev.products.some((p) => p.id === product.id);
      if (isSelected) {
        return {
          ...prev,
          products: prev.products.filter((p) => p.id !== product.id),
        };
      } else {
        return {
          ...prev,
          products: [...prev.products, product],
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.discountPercentage) {
      newErrors.discountPercentage = "Discount percentage is required";
    } else if (
      formData.discountPercentage < 0 ||
      formData.discountPercentage > 100
    ) {
      newErrors.discountPercentage = "Discount must be between 0 and 100";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = "End date must be after start date";
      } else if (endDate.getTime() === startDate.getTime()) {
        if (formData.endTime <= formData.startTime) {
          newErrors.endTime =
            "End time must be after start time when dates are the same";
        }
      }
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.image && !formData.imagePreview) {
      newErrors.image = "Deal image is required";
    }
    if (!formData.products || formData.products.length === 0) {
      newErrors.products = "At least one product must be selected";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formattedData = {
        ...formData,
        discountPercentage: Number(formData.discountPercentage),
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isActive: Boolean(formData.isActive),
        products: formData.products,
      };
      onSubmit(formattedData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {deal ? "Edit Deal" : "Create New Deal"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Fill in the details below to {deal ? "update" : "create"} your deal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Deal Image
          </label>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group w-full md:w-auto">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="deal-image"
              />
              <label
                htmlFor="deal-image"
                className="cursor-pointer flex items-center justify-center w-full md:w-40 h-40 border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200 group-hover:shadow-lg"
              >
                {formData.imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={formData.imagePreview}
                      alt="Deal preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    <span className="mt-2 block text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                      Click to upload
                    </span>
                  </div>
                )}
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload a high-quality image for your deal. Recommended size:
                800x600px. Supported formats: JPG, PNG, GIF.
              </p>
            </div>
          </div>
          <AnimatePresence>
            {errors.image && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-500"
              >
                {errors.image}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Basic Information Section */}
        <div className="grid grid-cols-1 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.title
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Enter deal title"
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.description
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Enter deal description"
            />
            <AnimatePresence>
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount Percentage
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPercent className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  errors.discountPercentage
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter discount percentage"
              />
            </div>
            <AnimatePresence>
              {errors.discountPercentage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.discountPercentage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Modern Product Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Products
            </label>

            {/* Selected Products Chips */}
            {formData.products.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm"
                  >
                    {product.productName || `Product ${product.id}`}
                    <button
                      type="button"
                      onClick={() => toggleProductSelection(product)}
                      className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Modern Dropdown Select */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <span className="truncate">
                  {formData.products.length > 0
                    ? `${formData.products.length} selected`
                    : "Select products"}
                </span>
                <FaChevronDown
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isProductDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProductDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-none focus:ring-0 text-sm"
                        />
                      </div>
                    </div>

                    {/* Product list */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product) => {
                          const isSelected = formData.products.some(
                            (p) => p.id === product.id
                          );
                          return (
                            <div
                              key={product.id}
                              onClick={() => toggleProductSelection(product)}
                              className={`flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 flex items-center justify-center mr-3 rounded border ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isSelected && (
                                  <FaCheck className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="truncate">
                                {product.productName || `Product ${product.id}`}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No products found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Helper text */}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select one or more products for this deal
            </p>
            <AnimatePresence>
              {errors.products && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.products}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Active Deal
            </label>
            <span
              className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                formData.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {formData.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Date and Time Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Deal Duration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.startDate
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              <AnimatePresence>
                {errors.startDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.startDate}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={
                    formData.startDate || new Date().toISOString().split("T")[0]
                  }
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.endDate
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              <AnimatePresence>
                {errors.endDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.endDate}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  step="300"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.startTime
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              <AnimatePresence>
                {errors.startTime && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.startTime}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  step="300"
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.endTime
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              <AnimatePresence>
                {errors.endTime && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.endTime}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : deal ? (
              "Update Deal"
            ) : (
              "Create Deal"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DealForm;
