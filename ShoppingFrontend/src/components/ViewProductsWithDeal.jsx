import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // For product search
  const [selectedCategory, setSelectedCategory] = useState("All"); // For product categorization
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract dealId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const dealId = queryParams.get("dealId");

  // Fetch products for the specific deal
  const fetchProducts = useCallback(async () => {
    try {
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const response = await fetch(`http://localhost:8080/api/deals/${dealId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("You do not have permission to access this resource.");
        } else {
          throw new Error("Failed to fetch products.");
        }
      }

      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error(error.message);
    }
  }, [token, logout, dealId]);

  useEffect(() => {
    if (dealId) {
      fetchProducts();
    } else {
      setError("No deal ID provided.");
      setLoading(false);
    }
  }, [fetchProducts, dealId]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const allCategories = new Set(products.map((product) => product.category));
    return ["All", ...Array.from(allCategories)];
  }, [products]);

  return (
    <div className="pt-20 px-4 md:px-10 lg:px-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">View Products</h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Explore the products associated with this deal.
        </p>
      </div>

      {/* Search Bar and Category Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-600 py-4">
          <p>Error: {error}</p>
          <button
            onClick={() => navigate("/deals")} // Navigate back to deals page
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-200"
          >
            Back to Deals
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : (
        Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300"
              >
                <LazyLoadImage
                  src={product.imageUrl || "https://via.placeholder.com/300x200?text=Product"}
                  alt={product.productName}
                  effect="blur"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{product.productName}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{product.description}</p>
                <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mt-4">
                  ${product.price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Category: {product.category}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            No products found.
          </div>
        )
      )}
    </div>
  );
};

export default ViewProductsPage;