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
    image: "",
    releaseDate: "",
    quantity: 0,
    price: 0,
    desc: "",
    available: false,
  });
  const [products, setProducts] = useState([]);
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

  const handleCancel = () => {
    setFormData({
      productName: "",
      brand: "",
      category: "",
      imageName: "",
      imageType: "",
      image: "",
      releaseDate: "",
      quantity: 0,
      price: 0,
      desc: "",
      available: false,
    });
    setImagePreview(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Destructure form data for better readability
    const {
      productName,
      brand,
      category,
      price,
      quantity,
      releaseDate,
      desc,
      available,
    } = formData;

    // Construct the product object
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
    // Append the product as a JSON string
    formDataToSend.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );
    // Append the image file
    formDataToSend.append("imageFile", formData.image);

    try {
      await axios.post("http://localhost:8080/api/product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProducts([...products, formData]);
      toast.success(`Product added successfully!`, {
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
      toast.error(`Error adding product!`, {
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  htmlFor="user_avatar"
                >
                  Product Image
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleImageChange}
                    name="image"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    aria-describedby="user_avatar_help"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description
                </label>
                <textarea
                  value={formData.desc}
                  onChange={(elem) => {
                    setFormData({
                      ...formData,
                      desc: elem.target.value,
                    });
                  }}
                  id="desc"
                  rows="4"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Product Description..."
                ></textarea>
              </div>
            </div>
            <ToastContainer />
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm/6 font-semibold text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
