import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { Table, Button, Alert, Spinner } from "flowbite-react";
import { FaUser, FaTrash, FaEdit } from "react-icons/fa";

const Users = () => {
  const { users, loading, error, toggleUserRole, deleteUser } = useContext(UserContext);
  const { hasRole, isAuthenticated } = useAuth();

  const [message, setMessage] = useState("");

  // Handle role toggle
  const handleToggleRole = async (id, currentRole) => {
    try {
      await toggleUserRole(id, currentRole);
      setMessage("User role updated successfully!");
    } catch (error) {
      setMessage(`Failed to update user role: ${error.message}`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setMessage("User deleted successfully!");
      } catch (error) {
        setMessage(`Failed to delete user: ${error.message}`);
      }
    }
  };

  // Clear messages after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // If the user is not authenticated, show a loading spinner or redirect to login
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // If the user is not an ADMIN, show an access denied message
  if (!hasRole("ADMIN")) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert color="failure">
          Access Denied: You do not have permission to view this page.
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-20 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">User Management</h1>

      {message && (
        <Alert color={message.includes("success") ? "success" : "failure"} className="mb-6">
          {message}
        </Alert>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {users.map((user, index) => (
              <Table.Row key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{user.userName}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    {/* Toggle Role Button */}
                    <Button
                      color="blue"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={loading}
                    >
                      <FaEdit className="mr-2" />
                      {user.role === "ADMIN" ? "Make User" : "Make Admin"}
                    </Button>

                    {/* Delete User Button */}
                    <Button
                      color="red"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default Users;