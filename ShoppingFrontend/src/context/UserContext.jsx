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
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const clearError = () => setError(null);

  const handleApiError = useCallback((error, defaultMessage) => {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
        logout();
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  }, [logout]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Authentication required to view users.");
      return;
    }

    if (!hasRole("ADMIN")) {
      setError("Admin privileges required to view users.");
      return;
    }

    let currentToken = token;
    if (isTokenExpired(token)) {
      try {
        currentToken = await refreshToken();
        if (!currentToken) {
          setError("Session expired. Please login again.");
          logout();
          return;
        }
      } catch (error) {
        handleApiError(error, "Failed to refresh session.");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUsers(response.data);
    } catch (error) {
      handleApiError(error, "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasRole, isTokenExpired, logout, refreshToken, handleApiError]);

  useEffect(() => {
    if (isAuthenticated && hasRole("ADMIN")) {
      fetchUsers();
    }
  }, [isAuthenticated, fetchUsers, hasRole]);

  const toggleUserRole = useCallback(
    async (id, currentRole) => {
      if (!isAuthenticated) {
        setError("Authentication required to modify user roles.");
        return;
      }

      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

      try {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === id ? { ...user, role: newRole } : user
          )
        );

        await axios.put(
          `http://localhost:8080/api/users/${id}/role`,
          { role: newRole },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success(`User role updated to ${newRole}`);
      } catch (error) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === id ? { ...user, role: currentRole } : user
          )
        );
        handleApiError(error, "Failed to update user role.");
      }
    },
    [isAuthenticated, token, handleApiError]
  );

  const deleteUser = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete users.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await axios.delete(`http://localhost:8080/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        toast.success("User deleted successfully.");
      } catch (error) {
        handleApiError(error, "Failed to delete user.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, handleApiError]
  );

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8080/api/users/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.imageData) {
        try {
          const bytes = new Uint8Array(response.data.imageData);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          const base64Image = `data:${response.data.imageType};base64,${btoa(binary)}`;
          response.data.imagePreview = base64Image;
        } catch (error) {
          console.error('Image processing error:', error);
          response.data.imagePreview = null;
        }
      }
      
      setUser(response.data);
    } catch (error) {
      handleApiError(error, "Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const updateUser = useCallback(async (userData, imageFile) => {
    if (!isAuthenticated || !user) {
      throw new Error("Authentication required to update profile.");
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userName', userData.userName || '');
      formData.append('firstName', userData.firstName || '');
      formData.append('lastName', userData.lastName || '');
      formData.append('email', userData.email || '');
      formData.append('phoneNumber', userData.phoneNumber || '');
      
      if (userData.password) {
        formData.append('password', userData.password);
      }

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

      if (response.data.imageData) {
        try {
          const bytes = new Uint8Array(response.data.imageData);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          const base64Image = `data:${response.data.imageType};base64,${btoa(binary)}`;
          response.data.imagePreview = base64Image;
        } catch (error) {
          console.error('Image processing error:', error);
          response.data.imagePreview = null;
        }
      }

      setUser(response.data);
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (error) {
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "You don't have permission to update this profile.";
        } else if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

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