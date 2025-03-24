import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import {
  Table,
  Button,
  Alert,
  Spinner,
  Modal,
  TextInput,
} from "flowbite-react";
import { FaUser, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { ThemeContext } from "../../context/ThemeContext";

const Users = () => {
  const { isDark } = useContext(ThemeContext);
  const { users, loading, error, toggleUserRole, deleteUser } =
    useContext(UserContext);
  const { hasRole, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleToggleRole = async (id, currentRole) => {
    try {
      await toggleUserRole(id, currentRole);
      setMessage("User role updated successfully!");
    } catch (error) {
      setMessage(`Failed to update user role: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    setSelectedUserId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUserId);
      setMessage("User deleted successfully!");
    } catch (error) {
      setMessage(`Failed to delete user: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isAuthenticated || !hasRole("ADMIN")) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert color="failure">
          Access Denied: You do not have permission to view this page.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen p-8 pt-20 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        User Management
      </h1>
      {message && (
        <Alert
          color={message.includes("success") ? "success" : "failure"}
          className="mb-6"
        >
          {message}
        </Alert>
      )}

      <div className="mb-6">
        <TextInput
          icon={FaSearch}
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>First Name</Table.HeadCell>
            <Table.HeadCell>Last Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredUsers.map((user, index) => (
              <Table.Row
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{user.userName}</Table.Cell>
                <Table.Cell>{user.firstName}</Table.Cell>
                <Table.Cell>{user.lastName}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      color="blue"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={loading}
                    >
                      <FaEdit className="mr-2" />
                      {user.role === "ADMIN" ? "Make User" : "Make Admin"}
                    </Button>
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

      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Confirm Deletion</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p>Are you sure you want to delete this user?</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
