import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaClock, FaPercent, FaCalendarAlt, FaImage, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const DealsTable = ({ deals, loading, onDelete, onEdit, onToggleStatus, hasRole }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const isCurrentlyActive = (deal) => {
    const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
    const endDateTime = new Date(`${deal.endDate}T${deal.endTime}`);
    return deal.isActive && currentTime >= startDateTime && currentTime <= endDateTime;
  };

  const getStatusInfo = (deal) => {
    const currentlyActive = isCurrentlyActive(deal);
    if (!deal.isActive) {
      return { status: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
    if (currentlyActive) {
      return { status: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    }
    const startDateTime = new Date(`${deal.startDate}T${deal.startTime}`);
    if (currentTime < startDateTime) {
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    }
    return { status: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <FaCalendarAlt className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">No deals found</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Create a new deal to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              {hasRole("ADMIN") && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {deals.map((deal) => (
                <motion.tr
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-16 w-16">
                      {deal.imageUrl ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={deal.imageUrl}
                          alt={deal.title}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FaImage className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {deal.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                      {deal.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaPercent className="text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {deal.discountPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                      <FaClock className="text-blue-500" />
                      <span>
                        {format(new Date(deal.startDate), 'MMM d, yyyy')} - {format(new Date(deal.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(deal).color}`}>
                      {getStatusInfo(deal).status}
                    </span>
                  </td>
                  {hasRole("ADMIN") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Toggle clicked for deal:', deal.id, 'current status:', deal.isActive);
                            onToggleStatus && onToggleStatus(deal.id, !deal.isActive);
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                          title={deal.isActive ? "Deactivate" : "Activate"}
                        >
                          {deal.isActive ? <FaToggleOn className="w-5 h-5 text-green-500" /> : <FaToggleOff className="w-5 h-5 text-red-500" />}
                        </button>
                        <button
                          onClick={() => onEdit(deal)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                          title="Edit Deal"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(deal.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                          title="Delete Deal"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealsTable;