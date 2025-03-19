import React from "react";
import { format } from "date-fns";
import { PencilIcon, TrashIcon } from "@heroicons/react/solid";

const DealsTable = ({ deals, loading, onDelete, hasRole, navigate }) => {
  if (loading) {
    return <div className="text-center dark:text-white">Loading deals...</div>;
  }

  if (deals.length === 0) {
    return <div className="text-center dark:text-white">No deals found.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <table className="w-full text-sm text-gray-600 dark:text-gray-300">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3">#</th>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Discount Percentage</th>
            <th className="px-6 py-3">Start Date</th>
            <th className="px-6 py-3">End Date</th>
            <th className="px-6 py-3">Active</th>
            <th className="px-6 py-3">Products</th>
            {hasRole("ADMIN") && <th className="px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, index) => (
            <tr
              key={deal.id}
              className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4">{deal.title}</td>
              <td className="px-6 py-4">{deal.description}</td>
              <td className="px-6 py-4">{deal.discountPercentage}%</td>
              <td className="px-6 py-4">
                {format(new Date(`${deal.startDate}T00:00:00Z`), "yyyy-MM-dd")}
              </td>
              <td className="px-6 py-4">
                {format(new Date(`${deal.endDate}T00:00:00Z`), "yyyy-MM-dd")}
              </td>
              <td className="px-6 py-4">{deal.isActive ? "Yes" : "No"}</td>
              <td className="px-6 py-4">
                {deal.products?.map((p) => p.productName).join(", ") || "No products"}
              </td>
              {hasRole("ADMIN") && (
                <td className="px-6 py-4 flex space-x-2">
                  <button
                    onClick={() => navigate(`/deals/edit/${deal.id}`)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(deal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DealsTable;