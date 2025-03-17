import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { format, parseISO } from "date-fns";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth"; // Import token expiration utility

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch active deals
  const fetchDeals = useCallback(async () => {
    if (isTokenExpired(token)) {
      // Token is expired, log out and redirect to login
      logout();
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/deals/active", {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the request
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, log out and redirect to login
          logout();
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch deals.");
      }

      const data = await response.json();
      setDeals(data);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  // Fetch deals on component mount
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy");
  }, []);

  // Memoized deals list
  const memoizedDeals = useMemo(() => deals, [deals]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchDeals();
  }, [fetchDeals]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter products by search query and category
  const filterProducts = (products) => {
    return products.filter((product) => {
      const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // Get unique categories from all products in deals
  const categories = useMemo(() => {
    const allCategories = new Set();
    deals.forEach((deal) => {
      if (deal.products && deal.products.length > 0) {
        deal.products.forEach((product) => {
          if (product.category) {
            allCategories.add(product.category);
          }
        });
      }
    });
    return ["All", ...Array.from(allCategories)];
  }, [deals]);

  // Handle "View Products" link click
  const handleViewProducts = (dealId) => {
    navigate(`/deals/products?dealId=${dealId}`);
  };

  return (
    <div className="pt-20 px-4 md:px-10 lg:px-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Active Deals</h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Check out the amazing discounts and offers available right now!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-600 py-4">
          <p>Error: {error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : (
        Array.isArray(memoizedDeals) && memoizedDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memoizedDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300"
              >
                <LazyLoadImage
                  src={deal.imageUrl || "https://via.placeholder.com/300x200?text=Deal"}
                  alt={deal.title}
                  effect="blur"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{deal.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{deal.description}</p>
                <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mt-4">
                  {deal.discountPercentage}% Off
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Valid from {formatDate(deal.startDate)} to {formatDate(deal.endDate)}
                </p>

                {/* View Products Link */}
                <button
                  onClick={() => handleViewProducts(deal.id)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition duration-200"
                >
                  View Products
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            No active deals available.
          </div>
        )
      )}
    </div>
  );
};

export default React.memo(DealsPage);