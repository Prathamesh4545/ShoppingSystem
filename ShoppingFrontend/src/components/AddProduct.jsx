import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    imageName: "",
    imageType: "",
    image: null,
    releaseDate: "",
    quantity: 0,
    price: 0,
    desc: "",
    available: false,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      image: file,
      imageName: file.name,
      imageType: file.type,
    }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      quantity: value,
      available: parseInt(value) > 0,
    }));
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      brand: "",
      category: "",
      imageName: "",
      imageType: "",
      image: null,
      releaseDate: "",
      quantity: 0,
      price: 0,
      desc: "",
      available: false,
    });
    setImagePreview(null);
  };

  const validateForm = () => {
    const { productName, brand, category, price, quantity, releaseDate } =
      formData;
    if (
      !productName ||
      !brand ||
      !category ||
      !price ||
      !quantity ||
      !releaseDate
    ) {
      toast.error("Please fill in all the required fields.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const {
      productName,
      brand,
      category,
      price,
      quantity,
      releaseDate,
      desc,
      available,
      image,
    } = formData;

    const product = {
      productName,
      brand,
      category,
      price,
      quantity,
      releaseDate,
      desc,
      available,
    };

    const formDataToSend = new FormData();
    formDataToSend.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );
    formDataToSend.append("imageFile", image);

    try {
      await axios.post("http://localhost:8080/api/product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      resetForm();
      toast.success("Product added successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || `Error adding product!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-100 rounded">
        <form
          className="space-y-8 divide-y divide-gray-200"
          onSubmit={onSubmitHandler}
        >
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-5xl font-serif text-center font-semibold text-gray-900">
              Add Products
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="name"
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

              <div className="sm:col-span-3">
                <label
                  htmlFor="brand"
                  className="block text-sm/6 font-medium text-gray-900"
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

              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-sm/6 font-medium text-gray-900"
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

              <div className="sm:col-span-3">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="user_avatar"
                >
                  Product Image
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleImageChange}
                    name="image"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer"
                    id="user_avatar"
                    type="file"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Product Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="release-date"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Release Date
                </label>
                <div className="mt-2">
                  <input
                    value={formData.releaseDate}
                    onChange={handleChange}
                    type="date"
                    name="releaseDate"
                    id="release-date"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="quantity"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Quantity
                </label>
                <div className="mt-2">
                  <input
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    type="number"
                    name="quantity"
                    id="quantity"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="price"
                  className="block text-sm/6 font-medium text-gray-900"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Description
                </label>
                <textarea
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  id="desc"
                  rows="4"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                  placeholder="Product Description..."
                ></textarea>
              </div>
            </div>

            <ToastContainer />

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={resetForm}
                className="text-sm/6 font-semibold text-gray-900"
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
    </>
  );
};

export default AddProduct;
