import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Product = () => {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      console.log("No id parameter found in the URL");
    }
  }, [id]);

  useEffect(() => {
    if (product.quantity === 0) {
      setQuantity(0);
    }
  }, [product.quantity]);

  const checkStock = () => {
    if (product.quantity > 0) {
      return "In Stock";
    } else {
      return "Out of Stock";
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/product/${id}`
      );
      setProduct(response.data);
    } catch (error) {
      setError("Failed to fetch product data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center bg-white border border-gray-200 rounded-lg shadow-lg md:max-w-4xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
        {/* Image Section */}
        <div className="w-full md:w-1/2 p-4">
          <img
            className="w-full h-auto object-cover rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105"
            src={
              product.imageData
                ? `data:image/jpeg;base64,${product.imageData}`
                : "/default-image.jpg"
            }
            alt={product.productName || "Product image"}
          />
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {product.category || "Category not available"}
          </span>
          <h5 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            {product.productName || "Product Name Not Available"}
          </h5>
          <p className="text-gray-700 dark:text-gray-400 mb-4">
            {product.desc || "No description available"}
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${product.price || "N/A"}
            </span>
            <div className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
              <span className="mr-2">Product Listed On:</span>
              <span>
                {product.releaseDate
                  ? product.releaseDate.substring(0, 10)
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-center py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {checkStock()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex mt-6 space-x-4">
            <button className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
              Add to Cart
            </button>
            <button className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-300">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
