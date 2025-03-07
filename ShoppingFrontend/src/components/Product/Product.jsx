import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isTokenExpired, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      logout();
      navigate("/");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8080/api/product/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized. Please log in.");
            logout();
            navigate("/");
          } else {
            setError("Failed to fetch product details.");
          }
        } else {
          const data = await response.json();
          setProduct(data);
        }
      } catch (err) {
        setError("An error occurred while fetching the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, logout, isTokenExpired]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center text-red-600">
        <FaExclamationCircle size={24} />
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="text-center text-gray-500">
        <p>Product not found</p>
      </div>
    );
  }

  // Product details
  return (
    <div className="pt-16">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          {product.name}
        </h2>
        <img
          src={product.imageUrl || "#"}
          alt={product.name}
          className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg mb-4"
        />
        <div className="mb-4">
          <h3 className="text-xl text-gray-700">Price: ${product.price}</h3>
          <p className="text-sm text-gray-600 mt-2">{product.description}</p>
        </div>
        <Button
          onClick={() => {}}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default Product;
