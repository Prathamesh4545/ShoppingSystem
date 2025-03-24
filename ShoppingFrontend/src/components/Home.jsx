import React, { useContext, useState, useMemo, useCallback, useEffect } from "react";
import { DataContext } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./Product/ProductCard";
import { ThemeContext } from "../context/ThemeContext";

const Home = () => {
  const { theme, isDark } = useContext(ThemeContext);
  const { products, isLoading, error } = useContext(DataContext);
  const { addToCart } = useCart();
  const { isAuthenticated, token, logout, refreshToken, isTokenExpired } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDealProducts, setSelectedDealProducts] = useState([]);
  const [isDealView, setIsDealView] = useState(false);
  const [activeDeals, setActiveDeals] = useState([]);
  const [isDealLoading, setIsDealLoading] = useState(false); // Loading state for deal products
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch active deals
  const fetchActiveDeals = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try refreshing it
          const newToken = await refreshToken();
          if (newToken) {
            // Retry the request with the new token
            return fetchActiveDeals();
          } else {
            // If refresh fails, log the user out
            logout();
            return;
          }
        }
        throw new Error("Failed to fetch active deals");
      }

      const data = await response.json();
      setActiveDeals(data);
    } catch (err) {
      toast.error("Failed to fetch active deals");
    }
  }, [token, refreshToken, logout]);

  useEffect(() => {
    fetchActiveDeals();
  }, [fetchActiveDeals]);

  // Fetch deal products
  const fetchDealProducts = useCallback(
    async (dealId, token) => {
      setIsDealLoading(true); // Start loading
      try {
        const response = await fetch(`http://localhost:8080/api/deals/${dealId}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token might be expired, try refreshing it
            const newToken = await refreshToken();
            if (newToken) {
              // Retry the request with the new token
              return fetchDealProducts(dealId, newToken);
            } else {
              // If refresh fails, log the user out
              logout();
              return;
            }
          }
          throw new Error("Failed to fetch deal products");
        }

        const data = await response.json();
        setSelectedDealProducts(data);
      } catch (err) {
        toast.error("Failed to fetch deal products");
      } finally {
        setIsDealLoading(false); // Stop loading
      }
    },
    [refreshToken, logout]
  );

  // Check for dealId in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dealId = queryParams.get("dealId");

    if (dealId) {
      setIsDealView(true);
      if (token && !isTokenExpired(token)) {
        fetchDealProducts(dealId, token);
      } else {
        // Token is expired or missing, try to refresh it
        refreshToken().then((newToken) => {
          if (newToken) {
            fetchDealProducts(dealId, newToken);
          } else {
            logout();
          }
        });
      }
    } else {
      setIsDealView(false);
    }
  }, [location.search, token, fetchDealProducts, refreshToken, logout, isTokenExpired]);

  // Optimized Category List
  const categories = useMemo(() => {
    try {
      return ["All", ...(products ? [...new Set(products.map((p) => p.category))] : [])];
    } catch (err) {
      toast.error("Failed to load categories. Please try again.");
      return ["All"];
    }
  }, [products]);

  // Apply discount to products based on active deals
  const applyDiscount = useMemo(() => {
    return (product) => {
      const deal = activeDeals.find((deal) =>
        deal.products?.some((p) => p.id === product.id)
      );
      const price = product.price || 0; // Fallback for null/undefined price
      if (deal) {
        return price * (1 - deal.discountPercentage / 100);
      }
      return price;
    };
  }, [activeDeals]);

  // Optimized Product Filtering
  const filteredProducts = useMemo(() => {
    if (isDealView) {
      return selectedDealProducts.map((product) => ({
        ...product,
        discountedPrice: applyDiscount(product),
      }));
    }
    return (selectedCategory === "All" ? products : products.filter((product) => product.category === selectedCategory))
      .filter(product => !isNaN(product.price))
      .map((product) => ({
        ...product,
        discountedPrice: applyDiscount(product),
      }));
  }, [isDealView, selectedDealProducts, products, selectedCategory, applyDiscount]);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Loading State
  if (isLoading || isDealLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3B82F6" size={50} />
      </div>
    );
  }

  // Error Handling
  if (error) {
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
    <div className={`pt-16 bg-gradient-to-br ${isDark ? 'from-gray-900 to-gray-800' : 'from-gray-50 to-gray-200'} min-h-screen`}>
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

export default React.memo(Home);