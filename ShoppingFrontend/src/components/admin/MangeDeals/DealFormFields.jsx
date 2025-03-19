import React from "react";
import { FixedSizeList as List } from "react-window";

const DealFormFields = ({
  isEditMode,
  formData,
  setFormData,
  products,
  loading,
  onSubmit,
}) => {
  const ProductList = () => (
    <List height={150} itemCount={products.length} itemSize={35} width={300}>
      {({ index, style }) => {
        const product = products[index];
        return (
          <div style={style} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(formData.productIds || []).includes(product.id)}
              onChange={() => {
                const updatedProductIds = (formData.productIds || []).includes(
                  product.id
                )
                  ? (formData.productIds || []).filter(
                      (id) => id !== product.id
                    )
                  : [...(formData.productIds || []), product.id];
                setFormData({ ...formData, productIds: updatedProductIds });
              }}
              className="dark:bg-gray-700"
            />
            <label className="dark:text-white">{product.productName}</label>
          </div>
        );
      }}
    </List>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Discount Percentage */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Discount Percentage</label>
          <input
            type="number"
            name="discountPercentage"
            value={formData.discountPercentage || 0}
            onChange={(e) =>
              setFormData({ ...formData, discountPercentage: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Image URL */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime || ""}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime || ""}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Active Status */}
        <div className="flex flex-col">
          <label className="mb-2 dark:text-white">Active</label>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive || false}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Product Selection */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-2 dark:text-white">Select Products</label>
          {products.length > 0 ? (
            <ProductList />
          ) : (
            <div className="dark:text-white">
              {loading ? "Loading products..." : "No products available"}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        disabled={loading}
      >
        {loading
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
          ? "Update Deal"
          : "Create Deal"}
      </button>
    </form>
  );
};

export default DealFormFields;
