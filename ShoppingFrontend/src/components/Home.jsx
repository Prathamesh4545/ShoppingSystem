import React, { useContext, useState, useMemo, memo } from "react";
import { DataContext } from "../context/ProductContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const Home = () => {
  const { products, isLoading, error } = useContext(DataContext);
  const { addToCart } = useContext(CartContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Memoize categories
  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((product) => product.category))];
  }, [products]);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Handle image loading errors
  const handleImageError = (e) => {
    console.log("Image failed to load, using fallback image");
  };

  // Handle category change with smooth scroll
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="m-4 flex justify-center">
        <ClipLoader color="#3B82F6" size={50} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-20 text-center mt-8">
        <p className="text-red-500">Error: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // No products available
  if (!products || products.length === 0) {
    return (
      <div className="text-center mt-8">
        <img
          src="/images/no-products.webp"
          alt="No products available"
          className="w-48 h-48 mx-auto"
        />
        <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
          No products available.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Category Filter */}
      <div className="sticky top-16 bg-white dark:bg-gray-800 z-40 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
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
            <div key={product.id} className="group relative">
              <Link to={`/product/${product.id}`} className="block">
                {/* Product Image */}
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    src={
                      product.images && product.images.length > 0
                        ? `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
                        : "/images/placeholder.webp" // Fallback to placeholder
                    }
                    alt={`Image of ${product.productName}`}
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>

                {/* Product Details */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.productName || product.name}
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

export default memo(Home);
