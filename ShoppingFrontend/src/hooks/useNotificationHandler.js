import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNotifications } from '../context/NotificationContext';
import { NotificationTemplates, createNotification } from '../utils/notificationService';

export const useNotificationHandler = () => {
  const { addNotification, showSuccess, showError, showWarning, showInfo } = useNotifications();

  // Show both toast and add to notification center
  const notify = useCallback((notification, showToast = true) => {
    // Add to notification center
    const notificationId = addNotification(notification);
    
    // Show toast notification
    if (showToast) {
      const toastOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };

      switch (notification.type) {
        case 'success':
          toast.success(notification.message, toastOptions);
          break;
        case 'error':
          toast.error(notification.message, toastOptions);
          break;
        case 'warning':
          toast.warning(notification.message, toastOptions);
          break;
        case 'info':
        default:
          toast.info(notification.message, toastOptions);
          break;
      }
    }
    
    return notificationId;
  }, [addNotification]);

  // Convenience methods using templates
  const notifyOrderPlaced = useCallback((orderId) => {
    return notify(NotificationTemplates.ORDER_PLACED(orderId));
  }, [notify]);

  const notifyOrderConfirmed = useCallback((orderId) => {
    return notify(NotificationTemplates.ORDER_CONFIRMED(orderId));
  }, [notify]);

  const notifyOrderShipped = useCallback((orderId, trackingNumber) => {
    return notify(NotificationTemplates.ORDER_SHIPPED(orderId, trackingNumber));
  }, [notify]);

  const notifyOrderDelivered = useCallback((orderId) => {
    return notify(NotificationTemplates.ORDER_DELIVERED(orderId));
  }, [notify]);

  const notifyOrderCancelled = useCallback((orderId) => {
    return notify(NotificationTemplates.ORDER_CANCELLED(orderId));
  }, [notify]);

  const notifyItemAddedToCart = useCallback((productName) => {
    return notify(NotificationTemplates.ITEM_ADDED_TO_CART(productName));
  }, [notify]);

  const notifyItemRemovedFromCart = useCallback((productName) => {
    return notify(NotificationTemplates.ITEM_REMOVED_FROM_CART(productName));
  }, [notify]);

  const notifyCartCleared = useCallback(() => {
    return notify(NotificationTemplates.CART_CLEARED());
  }, [notify]);

  const notifyLowStock = useCallback((productName, quantity) => {
    return notify(NotificationTemplates.LOW_STOCK(productName, quantity));
  }, [notify]);

  const notifyOutOfStock = useCallback((productName) => {
    return notify(NotificationTemplates.OUT_OF_STOCK(productName));
  }, [notify]);

  const notifyPriceDrop = useCallback((productName, oldPrice, newPrice) => {
    return notify(NotificationTemplates.PRICE_DROP(productName, oldPrice, newPrice));
  }, [notify]);

  const notifyNewDeal = useCallback((dealTitle, discount) => {
    return notify(NotificationTemplates.NEW_DEAL(dealTitle, discount));
  }, [notify]);

  const notifyDealEnding = useCallback((dealTitle, timeLeft) => {
    return notify(NotificationTemplates.DEAL_ENDING(dealTitle, timeLeft));
  }, [notify]);

  const notifyProfileUpdated = useCallback(() => {
    return notify(NotificationTemplates.PROFILE_UPDATED());
  }, [notify]);

  const notifyPasswordChanged = useCallback(() => {
    return notify(NotificationTemplates.PASSWORD_CHANGED());
  }, [notify]);

  const notifyLoginSuccess = useCallback((userName) => {
    return notify(NotificationTemplates.LOGIN_SUCCESS(userName));
  }, [notify]);

  const notifyLogoutSuccess = useCallback(() => {
    return notify(NotificationTemplates.LOGOUT_SUCCESS());
  }, [notify]);

  const notifyPaymentSuccess = useCallback((amount) => {
    return notify(NotificationTemplates.PAYMENT_SUCCESS(amount));
  }, [notify]);

  const notifyPaymentFailed = useCallback(() => {
    return notify(NotificationTemplates.PAYMENT_FAILED());
  }, [notify]);

  const notifyNetworkError = useCallback(() => {
    return notify(NotificationTemplates.NETWORK_ERROR());
  }, [notify]);

  const notifyServerError = useCallback(() => {
    return notify(NotificationTemplates.SERVER_ERROR());
  }, [notify]);

  const notifyValidationError = useCallback((field) => {
    return notify(NotificationTemplates.VALIDATION_ERROR(field));
  }, [notify]);

  // Custom notification method
  const notifyCustom = useCallback((type, title, message, options = {}) => {
    return notify(createNotification(type, title, message, options));
  }, [notify]);

  return {
    notify,
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyOrderShipped,
    notifyOrderDelivered,
    notifyOrderCancelled,
    notifyItemAddedToCart,
    notifyItemRemovedFromCart,
    notifyCartCleared,
    notifyLowStock,
    notifyOutOfStock,
    notifyPriceDrop,
    notifyNewDeal,
    notifyDealEnding,
    notifyProfileUpdated,
    notifyPasswordChanged,
    notifyLoginSuccess,
    notifyLogoutSuccess,
    notifyPaymentSuccess,
    notifyPaymentFailed,
    notifyNetworkError,
    notifyServerError,
    notifyValidationError,
    notifyCustom,
    // Direct access to notification context methods
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};