import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSync,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import ProductForm from "./ProductForm";
import { motion, AnimatePresence } from "framer-motion";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched products:", response.data); // Debug log
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    fetchProducts();
  };

  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen);
  };

  const toggleUpdateModal = (product = null) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(!isUpdateModalOpen);
  };

  const handleAddProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Create product object
      const productData = {
        productName: formData.productName,
        brand: formData.brand,
        desc: formData.desc,
        category: formData.category,
        price: formData.price,
        quantity: formData.quantity,
        available: formData.available,
        releaseDate: formData.releaseDate,
      };

      // Create FormData
      const data = new FormData();
      // Add product data as JSON string
      data.append(
        "product",
        new Blob([JSON.stringify(productData)], {
          type: "application/json",
        })
      );

      // Add images if they exist
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach((image) => {
          data.append("images", image);
        });
      }

      // Match the backend endpoint
      const response = await axios.post(
        "http://localhost:8080/api/product",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Product added successfully!");
        fetchProducts();
        toggleAddModal();
      }
    } catch (error) {
      console.error("Detailed error:", error.response?.data);
      toast.error(error.response?.data || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Create FormData
      const data = new FormData();

      // Create product object with all fields from the Product model
      const productData = {
        id: selectedProduct.id,
        productName: formData.productName,
        brand: formData.brand,
        desc: formData.desc,
        category: formData.category,
        releaseDate: formData.releaseDate,
        available: formData.available,
        quantity: formData.quantity,
        price: formData.price,
      };

      // Add product data as JSON string with correct content type
      data.append(
        "product",
        new Blob([JSON.stringify(productData)], {
          type: "application/json",
        })
      );

      // Always include images part as required by @RequestPart("images")
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach((image) => {
          data.append("images", image);
        });
      } else {
        // If no new images, send empty array to satisfy @RequestPart requirement
        data.append(
          "images",
          new Blob([JSON.stringify([])], {
            type: "application/json",
          })
        );
      }

      console.log("Updating product with data:", productData); // Debug log

      const response = await axios.put(
        `http://localhost:8080/api/product/${selectedProduct.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Product updated successfully!");
        fetchProducts();
        toggleUpdateModal(null);
      }
    } catch (error) {
      console.error("Detailed error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleEdit = (product) => {
    const formattedProduct = {
      ...product,
      id: product.id,
      productName: product.productName || "",
      brand: product.brand || "",
      desc: product.desc || "",
      category: product.category || "",
      price: product.price || 0,
      quantity: product.quantity || 0,
      available: product.available ?? true,
      releaseDate: product.releaseDate
        ? new Date(product.releaseDate).toISOString().split("T")[0]
        : "",
      images: product.images || [],
    };
    setSelectedProduct(formattedProduct);
    toggleUpdateModal(formattedProduct);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products
    .filter((product) => {
      if (!searchTerm) return true;
      const name = product?.productName || "";
      const description = product?.desc || "";
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a?.price || 0) - (b?.price || 0);
        case "price-desc":
          return (b?.price || 0) - (a?.price || 0);
        case "name-asc":
          return (a?.productName || "").localeCompare(b?.productName || "");
        case "name-desc":
          return (b?.productName || "").localeCompare(a?.productName || "");
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          All Products
        </h1>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={toggleAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add New Product
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSync className="w-8 h-8 text-blue-600 mx-auto" />
          </motion.div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={
                      product.images[0].imagePath
                        ? `http://localhost:8080/api/images/${product.images[0].imagePath}`
                        : `data:${product.images[0].imageType};base64,${product.images[0].imageData}`
                    }
                    alt={product.productName}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.src =
                        "https://placehold.co/400x300?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <FaImage className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {product.productName || "Unnamed Product"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                  {product.desc || "No description available"}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ₹ {product.price || "0"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-blue-900/50"
                      title="Update Product"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete Product"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No products found. {searchTerm && "Try adjusting your search."}
          </p>
        </div>
      )}

      <AnimatePresence>
        {isAddModalOpen && (
          <ProductModal
            title="Add New Product"
            onClose={toggleAddModal}
            onSubmit={handleAddProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUpdateModalOpen && selectedProduct && (
          <ProductModal
            title="Update Product"
            onClose={() => toggleUpdateModal(null)}
            onSubmit={handleUpdateProduct}
            product={selectedProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductModal = ({ title, onClose, onSubmit, product = null }) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                product={product}
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={false}
                isModal={true}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AllProducts;
