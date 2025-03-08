import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  const { isTokenExpired, logout } = useAuth();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("token");

      if (!token || isTokenExpired(token)) {
        logout();
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8080/api/product/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized. Please log in.");
            logout();
            navigate("/login");
          } else if (response.status === 404) {
            setError("Product not found.");
          } else {
            setError("Failed to fetch product details.");
          }
        } else {
          const data = await response.json();
          console.log("Product data fetched:", data);

          // Ensure imageData is valid
          const imageData = data.imageData || "https://via.placeholder.com/300";
          setProduct(data);
          setMainImage(imageData);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while fetching the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, logout, isTokenExpired]);

  const handleImageChange = (imageUrl) => {
    setMainImage(imageUrl);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value >= 1 ? value : 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
    }
  };

  const handleWishlist = () => {
    console.log("Added to wishlist:", product);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
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

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p className="text-lg">Product not found.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go Back to Home
        </Button>
      </div>
    );
  }

  // Debugging: Log the main image source
  console.log("Main Image Source:", mainImage);

  return (
    <div className="pt-20 bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap -mx-4">
          {/* Product Images */}
          <div className="w-full md:w-1/2 px-4 mb-8">
            <div className="w-full h-64 overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                src={mainImage.startsWith("http") ? mainImage : `data:image/jpeg;base64,${mainImage}`} // Handle both URLs and base64
                alt={product.productName}
                loading="lazy"
              />
            </div>
            <div className="flex gap-4 py-4 justify-center overflow-x-auto">
              {[
                product.imageData || "https://via.placeholder.com/300", // Use product image or placeholder
                "https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxMnx8aGVhZHBob25lfGVufDB8MHx8fDE3MjEzMDM2OTB8MA&ixlib=rb-4.0.3&q=80&w=1080",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw0fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080",
                "https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw4fHxoZWFkcGhvbmV8ZW58MHwwfHx8MTcyMTMwMzY5MHww&ixlib=rb-4.0.3&q=80&w=1080",
              ].map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl.startsWith("http") ? imageUrl : `data:image/jpeg;base64,${imageUrl}`} // Handle both URLs and base64
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
            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Add to Cart and Wishlist Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button onClick={handleAddToCart}>Add to Cart</Button>
              <Button onClick={handleWishlist}>Wishlist</Button>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;