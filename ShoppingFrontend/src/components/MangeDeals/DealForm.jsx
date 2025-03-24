import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useAuth } from "../../context/AuthContext";
import { API_URL, PRODUCTS_ENDPOINT } from "../../config/constants";
import "react-datepicker/dist/react-datepicker.css";

const DealForm = ({ initialValues, onSubmit, onClose, isEditMode }) => {
  const { token, refreshToken, logout, isTokenExpired } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formError, setFormError] = useState("");

  // Validation Schema
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        title: Yup.string()
          .required("Title is required")
          .min(3, "Title must be at least 3 characters"),
        description: Yup.string().required("Description is required"),
        discountPercentage: Yup.number()
          .required("Discount is required")
          .min(1, "Discount must be at least 1%")
          .max(100, "Discount cannot exceed 100%"),
        startDate: Yup.date()
          .required("Start date is required")
          .test(
            "is-before-end-date",
            "Start date must be before end date",
            function (value) {
              const endDate = this.parent.endDate;
              return !endDate || value <= endDate;
            }
          ),
        endDate: Yup.date()
          .required("End date is required")
          .min(Yup.ref("startDate"), "End date must be after start date"),
        startTime: Yup.date().required("Start time is required"),
        endTime: Yup.date()
          .required("End time is required")
          .when(
            ["startDate", "endDate", "startTime"],
            (startDate, endDate, startTime, schema) => {
              if (startDate && endDate && startDate === endDate) {
                return schema.min(
                  startTime,
                  "End time must be after start time"
                );
              }
              return schema;
            }
          ),
        productIds: Yup.array()
          .min(1, "At least one product must be selected")
          .required("Product selection is required"),
        imageUrl: Yup.string().url("Invalid URL format").nullable(),
        isActive: Yup.boolean(),
      }),
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(PRODUCTS_ENDPOINT);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let currentToken = token;
      if (isTokenExpired(currentToken)) {
        currentToken = await refreshToken();
        if (!currentToken) {
          logout();
          return;
        }
      }

      const formattedValues = {
        ...values,
        products: values.productIds.map((id) => ({ id })),
        startDate: values.startDate.toISOString().split("T")[0],
        endDate: values.endDate.toISOString().split("T")[0],
        startTime: values.startTime
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5),
        endTime: values.endTime.toTimeString().split(" ")[0].substring(0, 5),
        isActive: values.isActive,
      };

      await onSubmit(formattedValues, { setSubmitting, resetForm });
    } catch (error) {
      setFormError(error.message || "An error occurred during submission");
      setSubmitting(false);
    }
  };
  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.productName,
      })),
    [products]
  );

  const initialFormValues = useMemo(
    () => ({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      discountPercentage: initialValues?.discountPercentage || 0,
      imageUrl: initialValues?.imageUrl || "",
      startDate: initialValues?.startDate
        ? new Date(initialValues.startDate)
        : new Date(),
      endDate: initialValues?.endDate
        ? new Date(initialValues.endDate)
        : new Date(),
      startTime: initialValues?.startTime
        ? new Date(`1970-01-01T${initialValues.startTime}`)
        : new Date(),
      endTime: initialValues?.endTime
        ? new Date(`1970-01-01T${initialValues.endTime}`)
        : new Date(),
      isActive: initialValues?.isActive ?? true,
      productIds: initialValues?.products
        ? initialValues.products.map((product) => product.id)
        : [],
    }),
    [initialValues]
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          {isEditMode ? "Edit Deal" : "Create New Deal"}
        </h2>

        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-4">
              {formError && (
                <div className="text-red-500 text-sm">{formError}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Title
                  </label>
                  <Field
                    name="title"
                    type="text"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Discount Percentage
                  </label>
                  <Field
                    name="discountPercentage"
                    type="number"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="discountPercentage"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Start Date
                  </label>
                  <DatePicker
                    selected={values.startDate}
                    onChange={(date) => setFieldValue("startDate", date)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="startDate"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    End Date
                  </label>
                  <DatePicker
                    selected={values.endDate}
                    onChange={(date) => setFieldValue("endDate", date)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="endDate"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Start Time
                  </label>
                  <DatePicker
                    selected={values.startTime}
                    onChange={(date) => setFieldValue("startTime", date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="startTime"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300">
                    End Time
                  </label>
                  <DatePicker
                    selected={values.endTime}
                    onChange={(date) => setFieldValue("endTime", date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="endTime"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Product Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Select Products
                  </label>
                  <Select
                    isMulti
                    options={productOptions}
                    isLoading={loadingProducts}
                    value={productOptions.filter((option) =>
                      values.productIds.includes(option.value)
                    )}
                    onChange={(selected) =>
                      setFieldValue(
                        "productIds",
                        selected.map((option) => option.value)
                      )
                    }
                    className="dark:text-gray-900"
                  />
                  <ErrorMessage
                    name="productIds"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Image URL
                  </label>
                  <Field
                    name="imageUrl"
                    type="url"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="imageUrl"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium dark:text-gray-300">
                    Description
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows={3}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Field
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium dark:text-gray-300"
                  >
                    Active Deal
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Save Deal"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DealForm;
