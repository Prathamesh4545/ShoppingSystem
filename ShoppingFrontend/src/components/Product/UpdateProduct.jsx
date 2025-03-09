import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UpdateProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    image: null,
    releaseDate: "",
    quantity: 0,
    price: 0,
    desc: "",
    available: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const navigate = useNavigate();
  const { isTokenExpired, logout } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

  // Check token validity on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on mount:", token); // Debugging log

    if (!token || isTokenExpired(token)) {
      console.log("Token expired or missing, logging out..."); // Debugging log
      logout();
      navigate("/");
    }
  }, [navigate, logout, isTokenExpired]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      try {
        console.log("Fetching product data..."); // Debugging log
        const { data } = await axios.get(`${API_BASE_URL}/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched Product Data:", data); // Debugging log

        setFormData({
          productName: data.productName || "",
          brand: data.brand || "",
          category: data.category || "",
          image: null,
          releaseDate: data.releaseDate || "",
          quantity: data.quantity || 0,
          price: data.price || 0,
          desc: data.desc || "",
          available: data.quantity > 0,
        });

        if (data.imageData) {
          setImagePreview(`data:image/jpeg;base64,${data.imageData}`);
          console.log("Image preview set:", imagePreview); // Debugging log
        }
      } catch (error) {
        console.error("Error fetching product:", error); // Debugging log
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/");
        } else {
          toast.error(
            error?.response?.data?.message || "Error fetching product data"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, logout, navigate, API_BASE_URL]);

  // Log formData changes
  useEffect(() => {
    console.log("Form Data Updated:", formData); // Debugging log
  }, [formData]);

  // Log imagePreview changes
  useEffect(() => {
    console.log("Image Preview Updated:", imagePreview); // Debugging log
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Updating Field:", name, "Value:", value); // Debugging log
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      available: name === "quantity" ? parseInt(value) > 0 : prevData.available,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB.");
        return;
      }
      setFormData((prevData) => ({ ...prevData, image: file }));
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Image Preview:", reader.result); // Debugging log
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All changes will be lost."
      )
    ) {
      setFormData({
        productName: "",
        brand: "",
        category: "",
        image: null,
        releaseDate: "",
        quantity: 0,
        price: 0,
        desc: "",
        available: false,
      });
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const { productName, brand, category, quantity, price, releaseDate } =
      formData;
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return false;
    }
    if (!brand.trim()) {
      toast.error("Brand is required.");
      return false;
    }
    if (!category.trim()) {
      toast.error("Category is required.");
      return false;
    }
    if (quantity < 0) {
      toast.error("Quantity cannot be negative.");
      return false;
    }
    if (price <= 0) {
      toast.error("Price must be greater than 0.");
      return false;
    }
    if (releaseDate && new Date(releaseDate) > new Date()) {
      toast.error("Release date cannot be in the future.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { image, ...productData } = formData;
    productData.id = id;
    const formDataToSend = new FormData();
    formDataToSend.append(
      "product",
      new Blob([JSON.stringify(productData)], { type: "application/json" })
    );

    if (removeImage) {
      formDataToSend.append("removeImage", "true");
    } else if (!image && imagePreview) {
      formDataToSend.append("retainImage", "true");
    } else if (image) {
      formDataToSend.append("imageFile", image);
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Submitting form data..."); // Debugging log
      await axios.put(`${API_BASE_URL}/product/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Product updated successfully!");
      setTimeout(() => {
        navigate("/product/");
      }, 1000);
    } catch (error) {
      console.error("Error updating product:", error); // Debugging log
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Unauthorized access. Please login again.");
          navigate("/login");
        } else if (error.response.status === 400) {
          toast.error("Invalid data. Please check your inputs.");
        } else {
          toast.error("Error updating product!");
        }
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (field, type = "text", min = 0, step = 1) => (
    <div className="sm:col-span-3" key={field}>
      <label htmlFor={field} className="block text-sm font-medium text-gray-900">
        {field.charAt(0).toUpperCase() + field.slice(1)}
      </label>
      <div className="mt-2">
        <input
          type={type}
          name={field}
          id={field}
          value={formData[field]}
          onChange={handleChange}
          min={min}
          step={step}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          placeholder={`Enter ${field}`}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-100 rounded">
      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-5xl font-serif text-center font-semibold text-gray-900">
            Update Product
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {["productName", "brand", "category"].map((field) =>
              renderInputField(field)
            )}

            <div className="sm:col-span-3">
              <label
                htmlFor="user_avatar"
                className="block text-sm font-medium text-gray-900"
              >
                Product Image
              </label>
              <div className="mt-2">
                <input
                  type="file"
                  name="image"
                  id="user_avatar"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                    className="mr-2"
                  />
                  Remove Current Image
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label
                htmlFor="releaseDate"
                className="block text-sm font-medium text-gray-900"
              >
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                id="releaseDate"
                value={formData.releaseDate?.substring(0, 10) || ""}
                onChange={handleChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>

            {["quantity", "price"].map((field) =>
              renderInputField(
                field,
                "number",
                field === "quantity" ? 0 : 0.01,
                field === "quantity" ? 1 : 0.01
              )
            )}

            <div className="col-span-full">
              <label
                htmlFor="desc"
                className="block text-sm font-medium text-gray-900"
              >
                Description
              </label>
              <textarea
                id="desc"
                value={formData.desc}
                onChange={handleChange}
                rows="4"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product Description..."
              />
            </div>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-semibold text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => navigate("/product/")}
              className="text-sm font-semibold text-gray-900"
            >
              Back to Products
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;