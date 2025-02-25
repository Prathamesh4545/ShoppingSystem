import React, { useContext, useState } from "react";
import { DataContext } from "../context/ProductContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { products, isLoading, error } = useContext(DataContext);
  const { addToCart } = useContext(CartContext);
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for category filter

  // Extract unique categories from products
  const categories = ["All", ...new Set(products.map((product) => product.category))];

  // Filter products based on selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="m-2 flex flex-wrap justify-center">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
          >
            <div className="animate-pulse bg-white dark:bg-gray-800">
              <div className="h-64 w-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="mt-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error.message}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <div className="text-center mt-8">No products available.</div>;
  }

  return (
    <div className="pt-16"> {/* Add padding to align content below the sticky navbar */}
      {/* Category Filter */}
      <div className="sticky top-16 bg-white dark:bg-gray-800 z-40 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative"
            >
              <Link
                to={`/product/${product.id}`}
                className="block"
              >
                {/* Product Image */}
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    src={`data:image/jpeg;base64,${product.imageData}`}
                    alt={product.productName}
                    loading="lazy"
                  />
                </div>

                {/* Product Details */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.productName}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </p>
                </div>
              </Link>

              {/* Add to Cart Button */}
              <button
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
                aria-label={`Add ${product.productName} to cart`}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;