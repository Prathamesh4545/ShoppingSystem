import axios from "axios";

export const initializeCSRFProtection = async () => {
  try {
    const response = await axios.get("/api/csrf-token");
    return response.data.token;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return null;
  }
};

export const createSecureAxiosInstance = (token) => {
  const instance = axios.create({
    headers: {
      "X-CSRF-TOKEN": token,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return instance;
};
