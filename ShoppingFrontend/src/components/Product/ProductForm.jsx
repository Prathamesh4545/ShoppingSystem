import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductForm = ({ product, onSubmit, onCancel, isSubmitting, isModal }) => {
  const [formData, setFormData] = useState({
    productName: product?.productName || '',
    brand: product?.brand || '',
    desc: product?.desc || '',
    category: product?.category || '',
    releaseDate: product?.releaseDate ? new Date(product.releaseDate).toISOString().split('T')[0] : '',
    available: product?.available ?? true,
    quantity: product?.quantity || 0,
    price: product?.price || '',
    images: null
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        images: files
      }));
      
      // Create preview URLs for images
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName) newErrors.productName = 'Product name is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.desc) newErrors.desc = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!product && !formData.images) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Convert price to number if it's a string
        const submissionData = {
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        };
        
        await onSubmit(submissionData);
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Failed to submit form');
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.productName ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-500">{errors.productName}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.brand ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className={`mt-1 block w-full rounded-md border ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
          )}
        </div>

        {/* Release Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Release Date
          </label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          name="desc"
          value={formData.desc}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md border ${
            errors.desc ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
        />
        {errors.desc && (
          <p className="mt-1 text-sm text-red-500">{errors.desc}</p>
        )}
      </div>

      {/* Available Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
          Available for Sale
        </label>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Product Images
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload images</span>
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>
        {errors.images && (
          <p className="mt-1 text-sm text-red-500">{errors.images}</p>
        )}

        {/* Image Previews */}
        {previewImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </motion.form>
  );
};

export default ProductForm; 