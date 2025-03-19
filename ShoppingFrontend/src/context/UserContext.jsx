import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isAuthenticated, token, hasRole, isTokenExpired, logout, refreshToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users with proper role and token checks
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to view users.");
      return;
    }

    if (!hasRole("ADMIN")) {
      setError("You do not have permission to view users. Only ADMIN users can access this page.");
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
        setError("You do not have permission to view users. Only ADMIN users can access this page.");
      } else {
        setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
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

  const toggleUserRole = useCallback(async (id, currentRole) => {
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
      prevUsers.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );

    try {
      await axios.put(
        `http://localhost:8080/api/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? { ...user, role: currentRole } : user))
      );
      setError(`Failed to update the user's role: ${error.response?.data?.message || error.message}`);
    }
  }, [isAuthenticated, token, isTokenExpired, logout]);

  const deleteUser = useCallback(async (id) => {
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
      setError(`Failed to delete user: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isTokenExpired, logout]);

  const clearError = () => setError("");

  const contextValue = useMemo(() => ({
    users,
    loading,
    error,
    fetchUsers,
    toggleUserRole,
    deleteUser,
    clearError,
  }), [users, loading, error, fetchUsers, toggleUserRole, deleteUser]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Export the useUser hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export default UserProvider;