import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const clearError = () => setError(null);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setError(null);
    navigate("/", { replace: true });
    toast.info("You have been logged out successfully.");
  }, [navigate]);

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      if (!token) {
        throw new Error("No token available to refresh");
      }

      const response = await axios.post(
        "http://localhost:8080/api/users/refresh-token",
        { token },
        {
          headers: { "Content-Type": "application/json" },
          skipAuthRefresh: true 
        }
      );

      const newToken = response.data.token;
      if (!newToken) {
        throw new Error("Invalid token format received");
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      const errorMsg = error.response?.data?.message || 
                      "Session expired. Please login again.";
      setError(errorMsg);
      toast.error(errorMsg);
      logout();
      return null;
    }
  }, [token, logout]);

  const verifyAndSetAuthState = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      return;
    }

    try {
      setLoading(true);
      if (isTokenExpired(storedToken)) {
        const newToken = await refreshToken();
        if (!newToken) {
          logout();
          return;
        }
      }

      const parsedUser = JSON.parse(storedUser);
      parsedUser.roles = Array.isArray(parsedUser.roles) ? parsedUser.roles : ["USER"];
      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      console.error("Auth verification error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [isTokenExpired, refreshToken, logout]);

  useEffect(() => {
    verifyAndSetAuthState();
  }, [verifyAndSetAuthState]);

  const isAuthenticated = useMemo(() => {
    return Boolean(user && token && !isTokenExpired(token));
  }, [user, token, isTokenExpired]);

  const hasRole = useCallback(
    (requiredRole) => {
      return user?.roles?.includes(requiredRole) ?? false;
    },
    [user?.roles]
  );

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        credentials,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const { token: authToken, user: userData, roles } = response.data;

      if (!userData || !authToken) {
        throw new Error("Invalid authentication response from server");
      }

      const userWithId = {
        ...userData,
        id: Number(userData.id),
        roles: Array.isArray(roles) ? roles : ["USER"],
      };

      localStorage.setItem("user", JSON.stringify(userWithId));
      localStorage.setItem("token", authToken);

      setUser(userWithId);
      setToken(authToken);
      toast.success("Login successful!");

      return { user: userWithId, token: authToken };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Axios request interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token && !config.skipAuthRefresh) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            logout();
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken, logout]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      hasRole,
      login,
      logout,
      refreshToken,
      isTokenExpired,
      loading,
      error,
      clearError,
    }),
    [
      user,
      token,
      isAuthenticated,
      hasRole,
      login,
      logout,
      refreshToken,
      isTokenExpired,
      loading,
      error,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};