import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from './ProductForm';
import axios from 'axios';

const UpdateProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
          
        });
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        if (error.response?.status === 401) {
          toast.error('Unauthorized access. Please login again.');
          navigate('/login');
        } else {
          toast.error('Failed to fetch product details');
          navigate('/products');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const data = new FormData();
      data.append('name', formData.productName);
      data.append('description', formData.desc);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      if (formData.image && formData.image !== product.image) {
        data.append('image', formData.image);
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('Product updated successfully!');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized access. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/products')}
      isSubmitting={isSubmitting}
    />
  );
};

export default UpdateProduct;
