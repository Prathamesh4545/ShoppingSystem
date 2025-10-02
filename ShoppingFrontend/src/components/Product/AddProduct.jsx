import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import axios from 'axios';

const AddProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, data);
      if (response.status === 201) {
        toast.success('Product added successfully!');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      onCancel={() => navigate('/products')}
      isSubmitting={isSubmitting}
    />
  );
};

export default AddProduct;