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
import { isTokenExpired } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") ?? null
  );
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/", { replace: true });
  }, [navigate]);

  // Verify and set authentication state
  const verifyAndSetAuthState = useCallback(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // Check if the token is expired or invalid
    if (!storedToken || !storedUser || isTokenExpired(storedToken)) {
      logout(); // Clear the authentication state
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // Ensure roles and id are set correctly
      parsedUser.roles = Array.isArray(parsedUser.roles)
        ? parsedUser.roles
        : ["USER"];
      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      console.error("Auth state verification failed:", error);
      logout(); // Clear the authentication state
    }
  }, [logout]);

  // Verify auth state on mount
  useEffect(() => {
    verifyAndSetAuthState();
  }, [verifyAndSetAuthState]);

  // Check if the user is authenticated
  const isAuthenticated = useMemo(() => {
    return Boolean(user && token && !isTokenExpired(token));
  }, [user, token]);

  // Check if the user has a specific role
  const hasRole = useCallback(
    (requiredRole) => {
      return user?.roles?.includes(requiredRole) ?? false;
    },
    [user?.roles]
  );

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        credentials
      );

      console.log("Server Response:", response.data);

      // Extract roles from the response data
      const { token: authToken, user, roles } = response.data;

      if (!user || !authToken) {
        throw new Error(
          "Invalid authentication credentials: Missing user or token."
        );
      }

      // Merge roles into the user object
      const userWithId = {
        ...user,
        id: Number(user.id),
        roles: Array.isArray(roles) ? roles : ["USER"], // Ensure roles is an array
      };

      // Store user & token
      localStorage.setItem("user", JSON.stringify(userWithId));
      localStorage.setItem("token", authToken);

      // Update state
      setUser(userWithId);
      setToken(authToken);

      return { user: userWithId, token: authToken };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error(
        error.response?.data?.message || "Authentication failed."
      );
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/refresh-token",
        { token } // Send the current token
      );
      const newToken = response.data.token;
      if (!newToken) throw new Error("Invalid token format");
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  }, [token, logout]);

  // Axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        const newToken = response.headers.authorization?.replace("Bearer ", "");
        if (newToken) {
          localStorage.setItem("token", newToken);
          setToken(newToken);
        }
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Attempt to refresh the token
          try {
            const newToken = await refreshToken();
            if (newToken) {
              // Retry the original request with the new token
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios(error.config);
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

  // Context value
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
    }),
    [user, token, isAuthenticated, hasRole, login, logout, refreshToken]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
