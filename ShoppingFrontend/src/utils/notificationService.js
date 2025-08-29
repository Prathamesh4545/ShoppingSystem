// Notification service for handling different types of notifications
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const NotificationTemplates = {
  // Order related notifications
  ORDER_PLACED: (orderId) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Order Placed Successfully',
    message: `Your order #${orderId} has been placed and is being processed.`
  }),
  
  ORDER_CONFIRMED: (orderId) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Order Confirmed',
    message: `Your order #${orderId} has been confirmed and will be shipped soon.`
  }),
  
  ORDER_SHIPPED: (orderId, trackingNumber) => ({
    type: NotificationTypes.INFO,
    title: 'Order Shipped',
    message: `Your order #${orderId} has been shipped. Tracking: ${trackingNumber}`
  }),
  
  ORDER_DELIVERED: (orderId) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Order Delivered',
    message: `Your order #${orderId} has been delivered successfully.`
  }),
  
  ORDER_CANCELLED: (orderId) => ({
    type: NotificationTypes.WARNING,
    title: 'Order Cancelled',
    message: `Your order #${orderId} has been cancelled.`
  }),

  // Cart related notifications
  ITEM_ADDED_TO_CART: (productName) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Added to Cart',
    message: `${productName} has been added to your cart.`
  }),
  
  ITEM_REMOVED_FROM_CART: (productName) => ({
    type: NotificationTypes.INFO,
    title: 'Removed from Cart',
    message: `${productName} has been removed from your cart.`
  }),
  
  CART_CLEARED: () => ({
    type: NotificationTypes.INFO,
    title: 'Cart Cleared',
    message: 'All items have been removed from your cart.'
  }),

  // Product related notifications
  LOW_STOCK: (productName, quantity) => ({
    type: NotificationTypes.WARNING,
    title: 'Low Stock Alert',
    message: `Only ${quantity} items left for "${productName}".`
  }),
  
  OUT_OF_STOCK: (productName) => ({
    type: NotificationTypes.ERROR,
    title: 'Out of Stock',
    message: `"${productName}" is currently out of stock.`
  }),
  
  PRICE_DROP: (productName, oldPrice, newPrice) => ({
    type: NotificationTypes.INFO,
    title: 'Price Drop Alert',
    message: `"${productName}" price dropped from $${oldPrice} to $${newPrice}!`
  }),

  // Deal related notifications
  NEW_DEAL: (dealTitle, discount) => ({
    type: NotificationTypes.INFO,
    title: 'New Deal Available',
    message: `${dealTitle} - ${discount}% off! Limited time offer.`
  }),
  
  DEAL_ENDING: (dealTitle, timeLeft) => ({
    type: NotificationTypes.WARNING,
    title: 'Deal Ending Soon',
    message: `"${dealTitle}" ends in ${timeLeft}. Don't miss out!`
  }),

  // User related notifications
  PROFILE_UPDATED: () => ({
    type: NotificationTypes.SUCCESS,
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully.'
  }),
  
  PASSWORD_CHANGED: () => ({
    type: NotificationTypes.SUCCESS,
    title: 'Password Changed',
    message: 'Your password has been changed successfully.'
  }),
  
  LOGIN_SUCCESS: (userName) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Welcome Back',
    message: `Welcome back, ${userName}!`
  }),
  
  LOGOUT_SUCCESS: () => ({
    type: NotificationTypes.INFO,
    title: 'Logged Out',
    message: 'You have been logged out successfully.'
  }),

  // Payment related notifications
  PAYMENT_SUCCESS: (amount) => ({
    type: NotificationTypes.SUCCESS,
    title: 'Payment Successful',
    message: `Payment of $${amount} processed successfully.`
  }),
  
  PAYMENT_FAILED: () => ({
    type: NotificationTypes.ERROR,
    title: 'Payment Failed',
    message: 'Payment could not be processed. Please try again.'
  }),

  // Error notifications
  NETWORK_ERROR: () => ({
    type: NotificationTypes.ERROR,
    title: 'Network Error',
    message: 'Please check your internet connection and try again.'
  }),
  
  SERVER_ERROR: () => ({
    type: NotificationTypes.ERROR,
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  }),
  
  VALIDATION_ERROR: (field) => ({
    type: NotificationTypes.ERROR,
    title: 'Validation Error',
    message: `Please check the ${field} field and try again.`
  })
};

// Helper function to create custom notifications
export const createNotification = (type, title, message, options = {}) => ({
  type,
  title,
  message,
  ...options
});

// Helper function to handle API response notifications
export const handleApiResponse = (response, successMessage, errorMessage) => {
  if (response.success) {
    return {
      type: NotificationTypes.SUCCESS,
      title: 'Success',
      message: successMessage || 'Operation completed successfully.'
    };
  } else {
    return {
      type: NotificationTypes.ERROR,
      title: 'Error',
      message: errorMessage || response.message || 'Something went wrong.'
    };
  }
};