import axios from "axios";

// CSRF is disabled on backend for stateless JWT authentication
export const initializeCSRFProtection = async () => {
  return null; // No CSRF token needed
};

export const createSecureAxiosInstance = (token) => {
  const instance = axios.create({
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("token")}`,
    },
  });
  return instance;
};
