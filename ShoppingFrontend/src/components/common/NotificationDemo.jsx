import React from 'react';
import { motion } from 'framer-motion';
import { useNotificationHandler } from '../../hooks/useNotificationHandler';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes, FaShoppingCart, FaUser, FaCreditCard } from 'react-icons/fa';

const NotificationDemo = () => {
  const {
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyItemAddedToCart,
    notifyItemRemovedFromCart,
    notifyLowStock,
    notifyNewDeal,
    notifyProfileUpdated,
    notifyPaymentSuccess,
    notifyPaymentFailed,
    notifyNetworkError,
    notifyCustom
  } = useNotificationHandler();

  const demoNotifications = [
    {
      title: 'Order Notifications',
      icon: <FaShoppingCart className="w-5 h-5" />,
      color: 'bg-blue-500',
      actions: [
        {
          label: 'Order Placed',
          action: () => notifyOrderPlaced('ORD12345'),
          color: 'bg-green-500 hover:bg-green-600'
        },
        {
          label: 'Order Confirmed',
          action: () => notifyOrderConfirmed('ORD12345'),
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      ]
    },
    {
      title: 'Cart Notifications',
      icon: <FaShoppingCart className="w-5 h-5" />,
      color: 'bg-purple-500',
      actions: [
        {
          label: 'Item Added',
          action: () => notifyItemAddedToCart('Wireless Headphones'),
          color: 'bg-green-500 hover:bg-green-600'
        },
        {
          label: 'Item Removed',
          action: () => notifyItemRemovedFromCart('Wireless Headphones'),
          color: 'bg-red-500 hover:bg-red-600'
        }
      ]
    },
    {
      title: 'Product Notifications',
      icon: <FaExclamationTriangle className="w-5 h-5" />,
      color: 'bg-yellow-500',
      actions: [
        {
          label: 'Low Stock Alert',
          action: () => notifyLowStock('Gaming Mouse', 3),
          color: 'bg-yellow-500 hover:bg-yellow-600'
        },
        {
          label: 'New Deal',
          action: () => notifyNewDeal('Electronics Sale', 25),
          color: 'bg-orange-500 hover:bg-orange-600'
        }
      ]
    },
    {
      title: 'User Notifications',
      icon: <FaUser className="w-5 h-5" />,
      color: 'bg-indigo-500',
      actions: [
        {
          label: 'Profile Updated',
          action: () => notifyProfileUpdated(),
          color: 'bg-indigo-500 hover:bg-indigo-600'
        }
      ]
    },
    {
      title: 'Payment Notifications',
      icon: <FaCreditCard className="w-5 h-5" />,
      color: 'bg-emerald-500',
      actions: [
        {
          label: 'Payment Success',
          action: () => notifyPaymentSuccess(99.99),
          color: 'bg-emerald-500 hover:bg-emerald-600'
        },
        {
          label: 'Payment Failed',
          action: () => notifyPaymentFailed(),
          color: 'bg-red-500 hover:bg-red-600'
        }
      ]
    },
    {
      title: 'System Notifications',
      icon: <FaTimes className="w-5 h-5" />,
      color: 'bg-gray-500',
      actions: [
        {
          label: 'Network Error',
          action: () => notifyNetworkError(),
          color: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Custom Success',
          action: () => notifyCustom('success', 'Custom Success', 'This is a custom success notification!'),
          color: 'bg-green-500 hover:bg-green-600'
        },
        {
          label: 'Custom Info',
          action: () => notifyCustom('info', 'Custom Info', 'This is a custom info notification with more details.'),
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notification System Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Click the buttons below to test different types of notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoNotifications.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg ${category.color} text-white mr-3`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.title}
              </h3>
            </div>
            
            <div className="space-y-2">
              {category.actions.map((action, actionIndex) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className={`w-full px-4 py-2 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${action.color}`}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          How to Use Notifications
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Notifications appear in the notification center (bell icon in navbar)</p>
          <p>• Toast notifications show temporarily at the top-right</p>
          <p>• Unread notifications show a red badge on the bell icon</p>
          <p>• Click notifications to mark them as read</p>
          <p>• Use "Mark all read" to clear all unread notifications</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;