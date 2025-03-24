import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Spinner } from "flowbite-react";
import { FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTokenExpired, logout } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      logout();
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please log in.");
          logout();
          navigate("/");
        } else if (response.status === 404) {
          setError("Product not found.");
        } else {
          setError(`Error ${response.status}: Failed to fetch product.`);
        }
        return;
      }

      const data = await response.json();
      setProduct(data);
      setMainImage(data.images?.[0]?.imageData || "");
    } catch (err) {
      setError("An error occurred while fetching the product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, logout, isTokenExpired]);

  // Fetch product on component mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle image change
  const handleImageChange = (imageUrl) => setMainImage(imageUrl);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(1, Math.min(product?.stockQuantity, parseInt(e.target.value, 10)));
    setQuantity(newQuantity);
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.stockQuantity) {
      toast.warning("Not enough stock available.");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity); // Pass productId and quantity
      toast.success(`${product.productName} added to cart!`);
    } catch (err) {
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-screen text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaExclamationCircle size={32} className="mb-2" />
        <p className="text-lg">{error}</p>
        <motion.button
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
        >
          Go Back to Home
        </motion.button>
      </motion.div>
    );
  }

  // Main product UI
  return (
    <motion.div
      className="pt-20 bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8 flex flex-wrap -mx-4">
        {/* Product Images */}
        <motion.div className="w-full md:w-1/2 px-4 mb-8" initial={{ x: -50 }} animate={{ x: 0 }}>
          <img
            src={
              mainImage
                ? `data:${product.images?.[0]?.imageType};base64,${mainImage}`
                : "/images/placeholder.webp"
            }
            alt="Product"
            className="w-full h-auto rounded-lg shadow-md mb-4"
            onError={(e) => (e.target.src = "/images/placeholder.webp")}
          />
          <div className="flex gap-4 py-4 justify-center overflow-x-auto">
            {product.images?.length ? (
              product.images.map((image, index) => (
                <motion.img
                  key={index}
                  src={`data:${image.imageType};base64,${image.imageData}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                  onClick={() => handleImageChange(image.imageData)}
                  whileHover={{ scale: 1.1 }}
                />
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No images available</span>
            )}
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div className="w-full md:w-1/2 px-4" initial={{ x: 50 }} animate={{ x: 0 }}>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {product.productName}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">SKU: {product.sku || "N/A"}</p>

          {/* Price Section */}
          <div className="mb-4">
            <span className="text-2xl font-bold mr-2 text-indigo-600 dark:text-indigo-400">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-gray-500 dark:text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6">{product.desc}</p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Quantity:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={product.stockQuantity}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-12 text-center rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          {/* Add to Cart Button */}
          <motion.button
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-400"
            onClick={handleAddToCart}
            disabled={quantity > product.stockQuantity || isAddingToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Product;