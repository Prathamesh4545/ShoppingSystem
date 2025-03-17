import React, { useContext, useState, useMemo, useCallback, useTransition, memo } from "react";
import { DataContext } from "../context/ProductContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Memoized Product Card for Performance
const ProductCard = memo(({ product, addToCart, isAuthenticated }) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    addToCart(product);
    toast.success(`${product.productName} added to cart!`);
  };

  return (
    <div className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.03]">
      <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.productName}`}>
        <div className="w-full h-64 overflow-hidden rounded-lg">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={
              imageError || !product.images?.length || !product.images[0]?.imageData
                ? "/images/placeholder.webp"
                : `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
            }
            alt={product.productName || "Product image"}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.productName || "Unnamed Product"}
          </h3>
          <p className="mt-1 text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button
        className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform duration-300 hover:scale-105"
        onClick={handleAddToCart}
        aria-label={`Add ${product.productName} to cart`}
      >
        <FaShoppingCart /> Add to Cart
      </button>
    </div>
  );
});

const Home = () => {
  const { products, isLoading, error } = useContext(DataContext);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  // Optimized Category List with Error Handling
  const categories = useMemo(() => {
    try {
      return ["All", ...(products ? [...new Set(products.map((p) => p.category))] : [])];
    } catch (err) {
      console.error("Error processing categories:", err);
      toast.error("Failed to load categories. Please try again.");
      return ["All"];
    }
  }, [products]);

  // Optimized Product Filtering
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Optimized Category Selection
  const handleCategoryChange = useCallback((category) => {
    startTransition(() => {
      setSelectedCategory(category);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3B82F6" size={50} />
      </div>
    );
  }

  // Error Handling
  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-500 text-lg font-semibold">Error: {error?.message || "Something went wrong."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          aria-label="Retry"
        >
          Retry
        </button>
      </div>
    );
  }

  // No Products Found
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <img src="/images/no-products.webp" alt="No products available" className="w-48 h-48 opacity-70" />
        <p className="mt-4 text-xl text-gray-800 dark:text-gray-200">No products available.</p>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Category Filter */}
      <div className="bg-inherit static top-16 bg-white dark:bg-gray-900 z-40 shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 justify-center py-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white dark:hover:bg-gray-600"
                }`}
                aria-label={`Filter by ${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Home);