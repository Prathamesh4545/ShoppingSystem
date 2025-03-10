import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/product/${id}`
        );
        setFormData({
          productName: data.productName || "",
          brand: data.brand || "",
          category: data.category || "",
          image: null, // Ensure image is handled separately
          releaseDate: data.releaseDate || "",
          quantity: data.quantity || 0,
          price: data.price || 0,
          desc: data.desc || "",
          available: data.quantity > 0,
        });
        if (data.imageData) {
          setImagePreview(`data:image/jpeg;base64,${data.imageData}`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching product data");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      available: name === "quantity" ? parseInt(value) > 0 : prevData.available,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevData) => ({ ...prevData, image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { image, ...productData } = formData;
    productData.id = id; // Add the product ID for the update
    const formDataToSend = new FormData();
    formDataToSend.append(
      "product",
      new Blob([JSON.stringify(productData)], { type: "application/json" })
    );

    if (image === null && imagePreview) {
      const byteCharacters = atob(imagePreview.split(",")[1]);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
      }

      const blob = new Blob(byteArrays, { type: "image/jpeg" });
      formDataToSend.append("imageFile", blob, "image.jpg");
    } else if (image) {
      formDataToSend.append("imageFile", image);
    }

    try {
      await axios.put(
        `http://localhost:8080/api/product/${id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Product updated successfully!");
      setTimeout(() => {
        navigate("/product/");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Error updating product!");
    }
  };

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
            {["productName", "brand", "category"].map((field) => (
              <div key={field} className="sm:col-span-3">
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-900"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name={field}
                    id={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
            ))}
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

            {["quantity", "price"].map((field) => (
              <div key={field} className="sm:col-span-2">
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-900"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="number"
                  name={field}
                  id={field}
                  value={formData[field]}
                  onChange={handleChange}
                  min={field === "quantity" ? 0 : 0.01}
                  step={field === "quantity" ? 1 : 0.01}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            ))}

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
          <ToastContainer />
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-semibold text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
