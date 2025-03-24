import React, { useContext, useEffect, useState } from "react";
import axios from "axios"; // Import axios
import { DataContext } from "../../context/ProductContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { SearchIcon, TrashIcon, PencilAltIcon } from "@heroicons/react/solid";
import { isTokenExpired } from "../../utils/auth";

const AllProducts = () => {
  const [productId, setProductId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const { products, setProducts, setSearchQuery, setSearchField } =
    useContext(DataContext);
  const { hasRole, token, logout } = useAuth();

  useEffect(() => {
    setSearchField("id");
    setSearchQuery(productId);
  }, [productId, setSearchField, setSearchQuery]);

  const deleteProduct = async (id) => {
    // Check if the user has the ADMIN role
    if (!hasRole("ADMIN")) {
      setError("You do not have permission to delete this product.");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    // Check if the token is expired
    if (isTokenExpired(token)) {
      setError("Your session has expired. Please log in again.");
      logout(); // Log out the user if the token is expired
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Make the DELETE request with the token in the headers
      await axios.delete(`http://localhost:8080/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the products list by removing the deleted product
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      // Handle errors
      setError(
        `Failed to delete the product: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setProductId(e.target.value);
    setError("");
    setSearchLoading(true);
    setTimeout(() => setSearchLoading(false), 500);
  };

  return (
    <div className="min-h-screen p-8 pt-20 bg-gray-100 dark:bg-gray-900">
      {/* Search Input */}
      <div className="max-w-lg mx-auto relative">
        <input
          value={productId}
          onChange={handleSearchChange}
          type="text"
          className="w-full p-4 pr-12 border rounded-lg shadow-sm dark:bg-gray-800 dark:text-white"
          placeholder="Enter product ID..."
          required
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {/* Product Table */}
      <div className="overflow-x-auto mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <table className="w-full text-sm text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-16 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Brand</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-9 py-3">Release Date</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Price</th>
              {hasRole("ADMIN") && (
                <th className="px-6 py-3 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {searchLoading ? "Searching..." : "No products found."}
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="p-4">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
                          : "/images/placeholder.webp"
                      }
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.webp";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">{product.productName}</td>
                  <td className="px-6 py-4">{product.brand}</td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    {product.desc}
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    {product.releaseDate?.substring(0, 10) || "N/A"}
                  </td>
                  <td className="px-6 py-4">{product.quantity}</td>
                  <td className="px-6 py-4">${product.price}</td>
                  {hasRole("ADMIN") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <Link
                          to={`/product/update/${product.id}`}
                          className="text-blue-500 hover:text-blue-700 transition"
                          aria-label="Edit product"
                        >
                          <PencilAltIcon className="h-5 w-5 inline-block" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          aria-label="Delete product"
                          disabled={loading}
                        >
                          <TrashIcon className="h-5 w-5 inline-block" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <p className="mt-4 text-center text-gray-500">Processing...</p>
      )}
    </div>
  );
};

export default AllProducts;
