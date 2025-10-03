import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    rating: product?.rating || '',
    sku: product?.sku || '',
    weight: product?.weight || '',
    dimensions: product?.dimensions || '',
    color: product?.color || '',
    size: product?.size || '',
    material: product?.material || '',
    warranty: product?.warranty || '',
    stockAlert: product?.stockAlert || 10,
    featured: product?.featured ?? false,
    trending: product?.trending ?? false,
    customShippingFee: product?.customShippingFee || '',
    images: null
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryConfig, setCategoryConfig] = useState({});

  const getVisibleFields = () => {
    const category = formData.category;
    const config = categoryConfig[category];
    if (!config || !config.requiredFields) {
      return ['color', 'size', 'material', 'weight', 'dimensions', 'warranty'];
    }
    return config.requiredFields.split(',');
  };

  // Fetch categories with configurations
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/categories');
        const categoryData = response.data;
        setCategories(categoryData.map(cat => cat.name));
        
        const config = {};
        categoryData.forEach(cat => {
          config[cat.name] = cat;
        });
        setCategoryConfig(config);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Load existing images when editing
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      const existingPreviews = product.images.map(img => ({
        id: img.id,
        url: img.imageData && img.imageType ? `data:${img.imageType};base64,${img.imageData}` : null
      })).filter(img => img.url);
      setExistingImages(existingPreviews);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (files && files.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: files
        }));
        
        // Create preview URLs for new images
        const previews = Array.from(files).map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
        toast.success(`${files.length} new image(s) selected`);
      }
    } else {
      if (name === 'category' && value === 'ADD_NEW') {
        setShowCustomCategory(true);
        setFormData(prev => ({ ...prev, category: '' }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
        if (name === 'category') {
          setShowCustomCategory(false);
          setCustomCategory('');
        }
      }
    }
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleAddNewCategory = async () => {
    if (!customCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    try {
      const newCategory = {
        name: customCategory,
        description: `${customCategory} products`,
        requiredFields: 'color,size,material,weight,dimensions,warranty',
        icon: '📦'
      };
      
      await axios.post('http://localhost:8080/api/categories', newCategory);
      setCategories(prev => [...prev, customCategory]);
      setCategoryConfig(prev => ({ ...prev, [customCategory]: newCategory }));
      setFormData(prev => ({ ...prev, category: customCategory }));
      setShowCustomCategory(false);
      setCustomCategory('');
      toast.success('New category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };



  const removeNewImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    
    if (formData.images) {
      const dt = new DataTransfer();
      Array.from(formData.images).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFormData(prev => ({ ...prev, images: dt.files }));
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
    if (!product && !formData.images && existingImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

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
          quantity: Number(formData.quantity),
          removedImageIds: removedImageIds
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
          {!showCustomCategory ? (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
            >
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
              <option value="ADD_NEW">+ Add New Category</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                placeholder="Enter new category"
                className={`mt-1 block w-full rounded-md border ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600`}
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="mt-1 px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 whitespace-nowrap"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomCategory(false);
                  setCustomCategory('');
                  setFormData(prev => ({ ...prev, category: '' }));
                }}
                className="mt-1 px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
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

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g., PROD-12345"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Stock Alert */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Stock Alert Threshold
          </label>
          <input
            type="number"
            name="stockAlert"
            value={formData.stockAlert}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Custom Shipping Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Custom Shipping Fee (₹)
          </label>
          <input
            type="number"
            name="customShippingFee"
            value={formData.customShippingFee}
            onChange={handleChange}
            step="0.01"
            placeholder="Leave empty for default"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set a custom shipping fee for this product. Leave empty to use default shipping rates.
          </p>
        </div>
      </div>

      {/* Category-Specific Fields */}
      {formData.category && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {categoryConfig[formData.category]?.icon && (
              <span className="text-2xl">{categoryConfig[formData.category].icon}</span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formData.category} Specific Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getVisibleFields().includes('color') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Black, White"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {getVisibleFields().includes('size') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g., M, L, XL"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {getVisibleFields().includes('material') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder={formData.category === 'Clothing' ? 'e.g., Cotton, Polyester' : formData.category === 'Furniture' ? 'e.g., Wood, Metal' : 'e.g., Plastic, Metal'}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {getVisibleFields().includes('weight') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="e.g., 1.5"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {getVisibleFields().includes('dimensions') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 10x20x5 cm"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            {getVisibleFields().includes('warranty') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  placeholder="e.g., 1 Year, 6 Months"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex items-center">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
            Featured Product
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="trending"
            checked={formData.trending}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
            Trending Product
          </label>
        </div>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Product Images {formData.images && `(${formData.images.length} selected)`}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-blue-500 transition-colors">
          <div className="space-y-1 text-center">
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-300">
              <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 px-3 py-1">
                <span>Upload multiple images</span>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 20MB each</p>
          </div>
        </div>
        {errors.images && (
          <p className="mt-1 text-sm text-red-500">{errors.images}</p>
        )}

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Current Images ({existingImages.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((img, index) => (
                <div key={`existing-${img.id}`} className="relative group">
                  <img
                    src={img.url}
                    alt={`Existing ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md border-2 border-green-500 dark:border-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setExistingImages(prev => prev.filter(i => i.id !== img.id));
                      setRemovedImageIds(prev => [...prev, img.id]);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                  <label className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FaUpload className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const newPreview = URL.createObjectURL(file);
                          setExistingImages(prev => prev.map(i => 
                            i.id === img.id ? { ...i, url: newPreview, replaced: true, newFile: file } : i
                          ));
                          setRemovedImageIds(prev => [...prev, img.id]);
                          const dt = new DataTransfer();
                          if (formData.images) {
                            Array.from(formData.images).forEach(f => dt.items.add(f));
                          }
                          dt.items.add(file);
                          setFormData(prev => ({ ...prev, images: dt.files }));
                        }
                      }}
                    />
                  </label>
                  <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                    Saved
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              New Images ({previewImages.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewImages.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md border-2 border-blue-500 dark:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                    New
                  </div>
                </div>
              ))}
            </div>
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