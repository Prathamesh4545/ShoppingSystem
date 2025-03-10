import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/ProductContext";

const GetProductById = () => {
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { products,setProducts, getAllProducts } = useContext(DataContext);

  useEffect(() => {
    if (productId) {
      getProduct(productId);
    } else {
      getAllProducts(); // Show all products when search is cleared
    }
  }, [productId]);

  const getProduct = async (id) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `http://localhost:8080/api/product/${id}`
      );
      setProducts([response.data]); // Update products with the fetched product
    } catch (error) {
      setError("Error fetching product. Please check the product ID.");
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (productId) {
      getProduct(productId);
    }
  };

  return (
    <>
      <div className="m-8">
        <form className="max-w-md mx-auto" onSubmit={submitHandler}>
          <label htmlFor="productId" className="sr-only">
            Product ID
          </label>
          <div className="relative">
            <input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              type="text"
              className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter product ID"
              required
            />
          </div>
        </form>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex justify-center mt-8">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Index
                </th>
                <th scope="col" className="px-16 py-3">
                  Image
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Categories
                </th>
                <th scope="col" className="px-6 py-3">
                  Release Date
                </th>
                <th scope="col" className=" px-6 py-3">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !loading && !error ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="p-4">
                      <img
                        src={product.imageUrl || "#"} // Use product image URL if available
                        alt={product.name}
                        className="w-16 md:w-32 max-w-full max-h-full"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <p className="text-gray-500 dark:text-gray-400">
                        {product.desc}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.category} // Assuming categories is an array
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.releaseDate}
                    </td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.price}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href="#"
                        className="font-medium m-2 text-red-600 dark:text-red-500 hover:underline"
                      >
                        Edit
                      </a>
                      <a
                        href="#"
                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
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
