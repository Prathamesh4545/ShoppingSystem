import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  API_URL,
  DEALS_ENDPOINT,
  PRODUCTS_ENDPOINT,
} from "../../../config/constants";
import DealFormFields from "./DealFormFields";

const DealForm = ({ isEditMode }) => {
  const { token, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize formData with default values
  const initialState = {
    title: "",
    description: "",
    discountPercentage: 0,
    imageUrl: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    isActive: true,
    productIds: [],
  };

  const [formData, setFormData] = useState(initialState);

  // Fetch products and deal data if in edit mode
  const fetchData = async () => {
    if (!token) {
      logout();
      return;
    }

    setLoading(true);
    try {
      // Fetch all products
      const productsRes = await axios.get(PRODUCTS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allProducts = productsRes.data || [];
      setProducts(allProducts);
      setFilteredProducts(allProducts);

      // Extract product IDs
      const productIds = allProducts.map((product) => product.id);

      if (isEditMode) {
        // Fetch deal details
        const dealRes = await axios.get(`${DEALS_ENDPOINT}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const deal = dealRes.data;

        // Set formData with fallback values
        setFormData({
          title: deal.title || "",
          description: deal.description || "",
          discountPercentage: deal.discountPercentage || 0,
          imageUrl: deal.imageUrl || "",
          startDate: deal.startDate || "",
          endDate: deal.endDate || "",
          startTime: deal.startTime?.substring(0, 5) || "",
          endTime: deal.endTime?.substring(0, 5) || "",
          isActive: deal.isActive || true,
          productIds: deal.products?.map((p) => p.id) || productIds,
        });
      } else {
        // Set default product IDs for new deals
        setFormData({ ...initialState, productIds });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch data");
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate discount percentage
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      setError("Discount percentage must be between 0 and 100.");
      toast.error("Discount percentage must be between 0 and 100.");
      return;
    }
  
    // Validate dates and times
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);
  
    if (startDateTime >= endDateTime) {
      setError("Start date/time must be before end date/time.");
      toast.error("Start date/time must be before end date/time.");
      return;
    }
  
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        discountPercentage: parseFloat(formData.discountPercentage),
        imageUrl: formData.imageUrl,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime + ":00", // Ensure time is correctly formatted
        endTime: formData.endTime + ":00", // Ensure time is correctly formatted
        isActive: formData.isActive,
        products: formData.productIds.map(id => ({ id })),
      };
  
      if (isEditMode) {
        await axios.put(`${DEALS_ENDPOINT}/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deal updated successfully!");
      } else {
        await axios.post(DEALS_ENDPOINT, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deal created successfully!");
      }
      navigate("/deals/manage");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save deal");
      toast.error(error.response?.data?.message || "Failed to save deal");
    }
};

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold dark:text-white mb-4">
          {isEditMode ? "Edit Deal" : "Create New Deal"}
        </h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <DealFormFields
          isEditMode={isEditMode}
          formData={formData}
          setFormData={setFormData}
          products={filteredProducts}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
};

export default DealForm;