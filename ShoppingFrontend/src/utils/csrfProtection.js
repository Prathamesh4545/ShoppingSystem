// CSRF Protection Utility
import axios from 'axios';

// Generate CSRF token
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Store CSRF token in session storage
export const setCSRFToken = (token) => {
  sessionStorage.setItem('csrf-token', token);
};

// Get CSRF token from session storage
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf-token');
};

// Create axios instance with CSRF protection
export const createSecureAxiosInstance = () => {
  const instance = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add CSRF token
  instance.interceptors.request.use(
    (config) => {
      const csrfToken = getCSRFToken();
      if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

// Initialize CSRF protection
export const initializeCSRFProtection = () => {
  const token = generateCSRFToken();
  setCSRFToken(token);
  return token;
};