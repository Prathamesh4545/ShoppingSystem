import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const {
    isAuthenticated,
    token,
    hasRole,
    isTokenExpired,
    logout,
    refreshToken,
  } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Fetch users with proper role and token checks
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to view users.");
      return;
    }

    if (!hasRole("ADMIN")) {
      setError(
        "You do not have permission to view users. Only ADMIN users can access this page."
      );
      return;
    }

    let currentToken = token;
    if (isTokenExpired(token)) {
      try {
        currentToken = await refreshToken();
        if (!currentToken) {
          setError("Your session has expired. Please log in again.");
          logout();
          return;
        }
      } catch (refreshError) {
        setError("Failed to refresh session. Please log in again.");
        logout();
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUsers(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        logout();
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view users. Only ADMIN users can access this page."
        );
      } else {
        setError(
          `Failed to fetch users: ${err.response?.data?.message || err.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasRole, isTokenExpired, logout, refreshToken]);

  useEffect(() => {
    if (isAuthenticated && hasRole("ADMIN")) {
      fetchUsers();
    }
  }, [isAuthenticated, fetchUsers, hasRole]);

  const toggleUserRole = useCallback(
    async (id, currentRole) => {
      if (!isAuthenticated) {
        setError("You must be logged in to change a user's role.");
        return;
      }

      if (isTokenExpired(token)) {
        setError("Your session has expired. Please log in again.");
        logout();
        return;
      }

      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, role: newRole } : user
        )
      );

      try {
        await axios.put(
          `http://localhost:8080/api/users/${id}/role`,
          { role: newRole },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, role: currentRole } : user
          )
        );
        setError(
          `Failed to update the user's role: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [isAuthenticated, token, isTokenExpired, logout]
  );

  const deleteUser = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setError("You must be logged in to delete a user.");
        return;
      }

      if (isTokenExpired(token)) {
        setError("Your session has expired. Please log in again.");
        logout();
        return;
      }

      setLoading(true);
      setError("");

      try {
        await axios.delete(`http://localhost:8080/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (error) {
        setError(
          `Failed to delete user: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, isTokenExpired, logout]
  );

  const clearError = () => setError("");

  // Fetch current user profile
  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process image data if present
      if (response.data.imageData) {
        try {
          const bytes = new Uint8Array(response.data.imageData);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          const base64Image = `data:${response.data.imageType};base64,${btoa(binary)}`;
          response.data.imagePreview = base64Image;
        } catch (error) {
          console.error('Error processing image:', error);
          response.data.imagePreview = null;
        }
      }
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Update user profile using existing endpoint
  const updateUser = useCallback(async (userData, imageFile) => {
    if (!isAuthenticated || !user) {
      throw new Error("You must be logged in to update your profile.");
    }

    if (isTokenExpired(token)) {
      try {
        const newToken = await refreshToken();
        if (!newToken) {
          throw new Error("Your session has expired. Please log in again.");
        }
      } catch (refreshError) {
        throw new Error("Failed to refresh session. Please log in again.");
      }
    }

    try {
      const formData = new FormData();
      
      // Append required fields
      formData.append('userName', userData.userName || '');
      formData.append('firstName', userData.firstName || '');
      formData.append('lastName', userData.lastName || '');
      formData.append('email', userData.email || '');
      formData.append('phoneNumber', userData.phoneNumber || '');
      
      // Append password only if provided
      if (userData.password) {
        formData.append('password', userData.password);
      }

      // Append image file if present
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      const response = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Process image data if present
      if (response.data.imageData) {
        try {
          const bytes = new Uint8Array(response.data.imageData);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          const base64Image = `data:${response.data.imageType};base64,${btoa(binary)}`;
          response.data.imagePreview = base64Image;
        } catch (error) {
          console.error('Error processing image:', error);
          response.data.imagePreview = null;
        }
      }

      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "You don't have permission to update this profile.";
        } else if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, token, isTokenExpired, refreshToken, user]);

  const contextValue = useMemo(
    () => ({
      users,
      loading,
      error,
      user,
      fetchUsers,
      toggleUserRole,
      deleteUser,
      clearError,
      updateUser,
      fetchCurrentUser
    }),
    [
      users,
      loading,
      error,
      user,
      fetchUsers,
      toggleUserRole,
      deleteUser,
      updateUser,
      fetchCurrentUser
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export default UserProvider;