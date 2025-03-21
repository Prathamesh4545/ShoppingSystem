import React, { useContext, useState, useMemo, useCallback, useEffect, memo } from "react";
import { DataContext } from "../context/ProductContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Memoized Product Card for Performance
const ProductCard = memo(({ product, addToCart, isAuthenticated, discountedPrice }) => {
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
          <p className="mt-1 text-lg font-bold text-blue-600">
            ${discountedPrice.toFixed(2)}{" "}
            {discountedPrice < product.price && (
              <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
            )}
          </p>
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
  const { isAuthenticated, token } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDealProducts, setSelectedDealProducts] = useState([]);
  const [isDealView, setIsDealView] = useState(false);
  const [activeDeals, setActiveDeals] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch active deals
  useEffect(() => {
    if (token) {
      fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch active deals");
          }
          return res.json();
        })
        .then((data) => setActiveDeals(data))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch active deals");
        });
    }
  }, [token]);

  // Check for dealId in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dealId = queryParams.get("dealId");

    if (dealId) {
      setIsDealView(true);
      // Fetch deal-specific products
      fetch(`http://localhost:8080/api/deals/${dealId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch deal products");
          }
          return res.json();
        })
        .then((data) => setSelectedDealProducts(data))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch deal products");
        });
    } else {
      setIsDealView(false);
    }
  }, [location.search, token]);

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

  // Apply discount to products based on active deals
  const applyDiscount = useCallback(
    (product) => {
      const deal = activeDeals.find((deal) =>
        deal.products?.some((p) => p.id === product.id)
      );
      if (deal) {
        return product.price * (1 - deal.discountPercentage / 100);
      }
      return product.price;
    },
    [activeDeals]
  );

  // Optimized Product Filtering
  const filteredProducts = useMemo(() => {
    if (isDealView) {
      return selectedDealProducts.map((product) => ({
        ...product,
        discountedPrice: applyDiscount(product),
      }));
    }
    return (selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory)).map((product) => ({
      ...product,
      discountedPrice: applyDiscount(product),
    }));
  }, [isDealView, selectedDealProducts, products, selectedCategory, applyDiscount]);

  // Optimized Category Selection
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (!filteredProducts || filteredProducts.length === 0) {
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
      {!isDealView && (
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
      )}

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              isAuthenticated={isAuthenticated}
              discountedPrice={product.discountedPrice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Home);