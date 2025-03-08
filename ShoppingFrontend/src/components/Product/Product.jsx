import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Product = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null); // Store product data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [quantity, setQuantity] = useState(1); // Quantity state
  const [mainImage, setMainImage] = useState(""); // Main image state

  const { isTokenExpired, logout } = useAuth(); // Auth context for token validation

  useEffect(() => {
    console.log("Component mounted. Fetching product...");

    const fetchProduct = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);

      // Check if the token is valid
      if (!token || isTokenExpired(token)) {
        console.log("Token is invalid or expired. Logging out...");
        logout(); // Log out the user
        navigate("/login"); // Redirect to login page
        return;
      }

      setLoading(true);
      setError(null);
      console.log("Fetching product details...");

      try {
        // Fetch product details from the backend
        const response = await fetch(
          `http://localhost:8080/api/product/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("API Response:", response);

        // Handle response
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized. Redirecting to login...");
            setError("Unauthorized. Please log in.");
            logout();
            navigate("/login");
          } else if (response.status === 404) {
            console.log("Product not found.");
            setError("Product not found.");
          } else {
            console.log("Failed to fetch product details.");
            setError("Failed to fetch product details.");
          }
        } else {
          const data = await response.json();
          console.log("Product data fetched:", data);
          setProduct(data); // Set product data
          setMainImage(data.imageUrl || "#"); // Set main image
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while fetching the product.");
      } finally {
        console.log("Fetching complete. Loading set to false.");
        setLoading(false); // Stop loading
      }
    };

    fetchProduct();
  }, [id, navigate, logout, isTokenExpired]);

  // Handle image change
  const handleImageChange = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value >= 1 ? value : 1);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    console.log("Added to cart:", product, "Quantity:", quantity);
    // Add your cart logic here
  };

  // Handle wishlist
  const handleWishlist = () => {
    console.log("Added to wishlist:", product);
    // Add your wishlist logic here
  };

  // Loading state
  if (loading) {
    console.log("Loading state: Showing spinner...");
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    console.log("Error state:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <FaExclamationCircle size={24} className="mb-2" />
        <p className="text-lg">{error}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go Back to Home
        </Button>
      </div>
    );
  }

  // Product not found
  if (!product) {
    console.log("Product not found state.");
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="text-lg">Product not found.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go Back to Home
        </Button>
      </div>
    );
  }

  // Product details
  console.log("Product data:", product);
  return (
    <div className="pt-20 bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          {/* Product Images */}
          <div className="w-full md:w-1/2 px-4 mb-8">
            <img
              src={mainImage}
              alt="Product"
              className="w-full h-auto rounded-lg shadow-md mb-4"
            />
            <div className="flex gap-4 py-4 justify-center overflow-x-auto">
              {[
                "https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxMnx8aGVhZHBob25lfGVufDB8MHx8fDE3MjEzMDM2OTB8MA&ixlib=rb-4.0.3&q=80&w=1080",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw0fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080",
                "https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw4fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080",
                "https://images.unsplash.com/photo-1528148343865-51218c4a13e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwzfHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080",
              ].map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="size-16 sm:size-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300"
                  onClick={() => handleImageChange(imageUrl)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 px-4">
            <h2 className="text-3xl font-bold mb-2">{product.productName}</h2>
            <p className="text-gray-600 mb-4">SKU: {product.sku || "N/A"}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold mr-2">${product.price}</span>
              <span className="text-gray-500 line-through">${product.originalPrice || "N/A"}</span>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
              <span className="ml-2 text-gray-600">4.5 (120 reviews)</span>
            </div>
            <p className="text-gray-700 mb-6">{product.desc}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Color:</h3>
              <div className="flex space-x-2">
                <button className="w-8 h-8 bg-black rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"></button>
                <button className="w-8 h-8 bg-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"></button>
                <button className="w-8 h-8 bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"></button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-12 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                className="bg-indigo-600 flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleAddToCart}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                Add to Cart
              </button>
              <button
                className="bg-gray-200 flex gap-2 items-center text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={handleWishlist}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                Wishlist
              </button>
            </div>

            {/* Future update */}
            {/* <div>
              <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;