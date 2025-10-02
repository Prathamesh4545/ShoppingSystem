import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { API_URL } from "../../config/constants";
import axios from "axios";
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserTimes,
  FaSearch,
  FaFilter,
  FaSort,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaChartLine,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaUserClock,
  FaUserGraduate,
  FaUserTie,
  FaUserFriends,
  FaUserCircle,
  FaUserCog,
  FaUserLock,
  FaUserSecret,
} from "react-icons/fa";

const Users = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { token, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsers: 0,
  });

  const validRoles = useMemo(() => ["USER", "ADMIN"], []);

  const handleAuthError = useCallback(() => {
    toast.error("Session expired. Please login again.");
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !hasRole("ADMIN")) {
        throw new Error("Unauthorized access");
      }

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.users || response.data || [];
      setUsers(
        (Array.isArray(data) ? data : []).map((user) => ({
          ...user,
          name: `${user.firstName} ${user.lastName}`,
          createdAt: new Date(user.createdAt).toLocaleDateString(),
        }))
      );
      // Calculate stats
      setStats({
        totalUsers: data.length,
        activeUsers: data.filter((user) => user.isActive).length,
        adminUsers: data.filter((user) => user.role === "ADMIN").length,
        newUsers: data.filter((user) => {
          const userDate = new Date(user.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return userDate > thirtyDaysAgo;
        }).length,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, hasRole, handleAuthError]);

  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response?.status === 404) {
        toast.error("User not found.");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        handleAuthError();
      } else {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!validRoles.includes(newRole)) {
      toast.error("Invalid role");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...updatedUser,
                createdAt: new Date(updatedUser.createdAt).toLocaleDateString(),
              }
            : user
        )
      );
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.status === 404) {
        toast.error("User not found.");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        handleAuthError();
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update user role"
        );
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !hasRole("ADMIN")) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [fetchUsers, isAuthenticated, hasRole, navigate]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          (user.userName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "ALL" || user.role === filterRole;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "name":
            return a.name.localeCompare(b.name);
          case "email":
            return a.email.localeCompare(b.email);
          default:
            return 0;
        }
      });
  }, [users, searchTerm, filterRole, sortBy]);

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "USER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <FaUserShield className="h-5 w-5" />;
      case "USER":
        return <FaUser className="h-5 w-5" />;
      default:
        return <FaUser className="h-5 w-5" />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`pt-16 min-h-screen p-8 ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white" 
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div
              className={`p-3 rounded-xl shadow-lg ${
                isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              }`}
            >
              <FaUsers className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">User Management</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your users and their roles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-6 shadow-lg backdrop-blur-sm border ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
            } hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <FaUsers className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-6 shadow-lg backdrop-blur-sm border ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
            } hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeUsers}</h3>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-green-50"
                }`}
              >
                <FaUserCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-6 shadow-lg backdrop-blur-sm border ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
            } hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Admin Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.adminUsers}</h3>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-purple-50"
                }`}
              >
                <FaUserShield className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl p-6 shadow-lg backdrop-blur-sm border ${
              isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
            } hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  New Users (30d)
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.newUsers}</h3>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-yellow-50"
                }`}
              >
                <FaUserClock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center"
          >
            <FaExclamationTriangle className="mr-2" />
            {error}
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-xl p-6 shadow-lg mb-8 backdrop-blur-sm border ${
            isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="ALL">All Roles</option>
              {validRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="email">Email (A-Z)</option>
            </select>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="overflow-x-auto"
        >
          <table className={`min-w-full shadow-xl rounded-xl overflow-hidden backdrop-blur-sm border ${
            isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
          }`}>
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Joined</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-3 font-medium">
                            {user.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-2">{user.role}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateRole(user.id, e.target.value)
                            }
                            className={`p-2 rounded-md border ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            {validRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            title="Delete user"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <FaUser className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No users found.
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-xl shadow-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <FaUserTimes className="w-8 h-8 text-red-500 mr-3" />
                    <h2 className="text-2xl font-bold">Delete User</h2>
                  </div>
                  <p className="mb-6">
                    Are you sure you want to delete user{" "}
                    <span className="font-medium">{selectedUser.name}</span>?
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      disabled={deleteLoading}
                      className={`px-4 py-2 rounded-lg text-white ${
                        deleteLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } transition-colors duration-200`}
                    >
                      {deleteLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Users;
