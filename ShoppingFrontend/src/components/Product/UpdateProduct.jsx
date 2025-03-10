import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UpdateProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    releaseDate: "",
    quantity: 1, // Default to 1 to avoid validation issues
    price: 0.01, // Default to 0.01 to avoid validation issues
    desc: "",
    available: false,
  });
  const [images, setImages] = useState([]); // Array to hold multiple images
  const [imagePreviews, setImagePreviews] = useState([]); // Array to hold image previews
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // For storing the current product details

  const navigate = useNavigate();
  const { isTokenExpired, logout } = useAuth();
  const { id } = useParams();

  // Fetch product details when the component loads
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      logout();
      navigate("/");
    }

    // Fetch product details by ID
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/product/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCurrentProduct(response.data);
        setFormData({
          productName: response.data.productName,
          brand: response.data.brand,
          category: response.data.category,
          releaseDate: response.data.releaseDate,
          quantity: response.data.quantity,
          price: response.data.price,
          desc: response.data.desc,
          available: response.data.quantity > 0,
        });
        setImagePreviews(response.data.imageUrls || []);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Error fetching product details!");
      }
    };

    fetchProductDetails();
  }, [id, navigate, logout, isTokenExpired]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      available: name === "quantity" ? parseInt(value) > 0 : prevData.available,
    }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const newImages = [];
    const newPreviews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `File ${file.name} is not a valid image type (JPEG, PNG, GIF).`
        );
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the 20MB size limit.`);
        continue;
      }

      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      brand: "",
      category: "",
      releaseDate: "",
      quantity: 1, // Reset to 1
      price: 0.01, // Reset to 0.01
      desc: "",
      available: false,
    });
    setImages([]);
    setImagePreviews([]);
  };

  const validateForm = () => {
    const { productName, brand, category, price, quantity, releaseDate } =
      formData;

    if (!productName) {
      toast.error("Product name is required.");
      return false;
    }
    if (!brand) {
      toast.error("Brand is required.");
      return false;
    }
    if (!category) {
      toast.error("Category is required.");
      return false;
    }
    if (!releaseDate) {
      toast.error("Release date is required.");
      return false;
    }
    if (price <= 0) {
      toast.error("Price must be greater than 0.");
      return false;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0.");
      return false;
    }
    if (images.length === 0) {
      toast.error("At least one product image is required.");
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append(
      "product",
      new Blob([JSON.stringify(formData)], { type: "application/json" })
    );

    images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/product/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log the response from the backend
      console.log("Response from backend:", response.data);

      // Display uploaded images
      if (response.data.imageUrls) {
        toast.success("Product and images updated successfully!");
        setImagePreviews(response.data.imageUrls);
      } else {
        toast.success("Product updated successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/");
      } else {
        toast.error(
          error?.response?.data?.message || "Error updating product!"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProduct) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-100 rounded">
        <form
          className="space-y-8 divide-y divide-gray-200"
          onSubmit={onSubmitHandler}
        >
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-5xl font-serif text-center font-semibold text-gray-900">
              Update Product
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Product Name */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="productName"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    value={formData.productName}
                    onChange={handleChange}
                    type="text"
                    name="productName"
                    id="productName"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Brand */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="brand"
                  className="block text-sm font-medium text-gray-900"
                >
                  Brand
                </label>
                <div className="mt-2">
                  <input
                    value={formData.brand}
                    onChange={handleChange}
                    type="text"
                    name="brand"
                    id="brand"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-900"
                >
                  Category
                </label>
                <div className="mt-2">
                  <input
                    value={formData.category}
                    onChange={handleChange}
                    type="text"
                    name="category"
                    id="category"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-900"
                >
                  Price
                </label>
                <div className="mt-2">
                  <input
                    value={formData.price}
                    onChange={handleChange}
                    type="number"
                    name="price"
                    id="price"
                    min="0.01"
                    step="0.01"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-900"
                >
                  Quantity
                </label>
                <div className="mt-2">
                  <input
                    value={formData.quantity}
                    onChange={handleChange}
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Release Date */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="releaseDate"
                  className="block text-sm font-medium text-gray-900"
                >
                  Release Date
                </label>
                <div className="mt-2">
                  <input
                    value={formData.releaseDate}
                    onChange={handleChange}
                    type="date"
                    name="releaseDate"
                    id="releaseDate"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="sm:col-span-3">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="images"
                >
                  Product Images
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleImageChange}
                    name="images"
                    id="images"
                    type="file"
                    multiple
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          aria-label="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other fields for release date, price, quantity, etc. */}
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={resetForm}
                className="text-sm/6 font-semibold text-gray-900"
                aria-label="Cancel and reset form"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50"
                aria-label="Save product"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateProduct;
