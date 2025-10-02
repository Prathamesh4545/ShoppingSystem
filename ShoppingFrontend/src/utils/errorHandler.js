import { toast } from 'react-toastify';

// Error types for different scenarios
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTH: 'AUTH',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

// Secure configuration - use environment variables
const getApiConfig = () => ({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: process.env.REACT_APP_API_TIMEOUT || 10000
});

// Error messages for different scenarios
const ErrorMessages = {
  [ErrorTypes.NETWORK]: {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    duration: 5000
  },
  [ErrorTypes.VALIDATION]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    duration: 4000
  },
  [ErrorTypes.AUTH]: {
    title: 'Authentication Error',
    message: 'Please log in to continue.',
    duration: 4000
  },
  [ErrorTypes.SERVER]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    duration: 5000
  },
  [ErrorTypes.UNKNOWN]: {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
    duration: 5000
  }
};

// Helper function to determine error type
const determineErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // Network errors
  if (!navigator.onLine || error.message.includes('network') || error.message.includes('Network')) {
    return ErrorTypes.NETWORK;
  }

  // Authentication errors
  if (error.status === 401 || error.status === 403 || error.message.includes('auth')) {
    return ErrorTypes.AUTH;
  }

  // Validation errors
  if (error.status === 400 || error.message.includes('validation')) {
    return ErrorTypes.VALIDATION;
  }

  // Server errors
  if (error.status >= 500) {
    return ErrorTypes.SERVER;
  }

  return ErrorTypes.UNKNOWN;
};

// Sanitize input to prevent log injection
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  return encodeURIComponent(input).replace(/[\r\n]/g, '');
};

// Main error handler function
export const handleError = (error, customMessage = null) => {
  const sanitizedMessage = customMessage ? sanitizeForLog(customMessage) : null;
  console.error('Error:', sanitizedMessage || (error?.message ? sanitizeForLog(error.message) : error));

  const errorType = determineErrorType(error);
  const errorConfig = ErrorMessages[errorType];

  // Use custom message if provided, otherwise use default message
  const message = customMessage || errorConfig.message;

  // Show error toast
  toast.error(message, {
    position: "top-right",
    autoClose: errorConfig.duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  // Return error type for further handling if needed
  return errorType;
};

// Validation error handler
export const handleValidationError = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return handleError(new Error('Invalid validation errors'));
  }

  // Handle multiple validation errors
  Object.entries(errors).forEach(([field, message]) => {
    toast.error(`${field}: ${message}`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  });

  return ErrorTypes.VALIDATION;
};

// API error handler
export const handleApiError = async (response, customMessage = null) => {
  let errorMessage = customMessage;

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || customMessage;
  } catch (e) {
    // If response is not JSON, use status text
    errorMessage = response.statusText || customMessage;
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  error.statusText = response.statusText;

  return handleError(error, errorMessage);
};

// Form error handler
export const handleFormError = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      toast.error(error, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  } else if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }

  return ErrorTypes.VALIDATION;
}; 