import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context/ProductContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook

const GetProductById = () => {
  const { user, isAuthenticated } = useAuth(); // Use the useAuth hook
  const [productId, setProductId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { products, setProducts, setSearchQuery, setSearchField } = useContext(DataContext);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchField("id");
      setSearchQuery(productId);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productId, setSearchField, setSearchQuery]);

  // Handle product deletion
  const deleteProduct = async (id) => {
    if (!isAuthenticated()) {
      setError("You must be logged in to delete a product.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      await axios.delete(`http://localhost:8080/api/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id)); // Update the state to remove the deleted product
      setSearchQuery("");
    } catch (error) {
      setError(`Failed to delete the product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setProductId(e.target.value);
  };

  return (
    <>
      <div className="m-8 max-w-md mx-auto">
        <label htmlFor="productId" className="sr-only">
          Product ID
        </label>
        <div className="relative">
          <input
            id="productId"
            value={productId}
            onChange={handleSearchChange}
            type="text"
            className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Enter product ID"
            required
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading && <p className="text-center">Loading...</p>}

      <div className="flex justify-center mt-8">
        <div className="relative mx-32 overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Index</th>
                <th scope="col" className="px-16 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Brand</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Categories</th>
                <th scope="col" className="px-9 py-3">Release Date</th>
                <th scope="col" className="px-6 py-3">Quantity</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="p-4">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
                            : "/images/placeholder.webp"
                        }
                        alt={product.productName}
                        className="w-16 md:w-32 max-w-full max-h-full"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.productName}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.brand}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <p className="text-gray-500 dark:text-gray-400">{product.desc}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.releaseDate ? product.releaseDate.substring(0, 10) : "N/A"}
                    </td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{product.price}</td>
                    <td className="px-6 py-4">
                      <Link to={`/product/update/${product.id}`} className="font-medium m-2 text-red-600 dark:text-red-500 hover:underline cursor-pointer">
                        Edit
                      </Link>
                      <a
                        onClick={() => deleteProduct(product.id)}
                        className="font-medium text-red-600 dark:text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GetProductById;
