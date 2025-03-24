import React from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const OrderList = ({ orders }) => {
  const { isDark } = useContext(ThemeContext);

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-lg p-6 ${
        isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h2
        className={`text-xl font-semibold mb-6 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Order History
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold text-gray-900">
                Order #{order.id}
              </p>
              <p
                className={`text-sm font-semibold ${
                  order.status === "PENDING"
                    ? "text-yellow-600"
                    : order.status === "COMPLETED"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {order.status}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <strong>Items:</strong>
              </p>
              <ul className="list-disc list-inside">
                {order.items.map((item) => (
                  <li key={item.productId} className="text-sm text-gray-600">
                    {item.productName} (Qty: {item.quantity}, Price: $
                    {item.price.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
