import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Role mapping between frontend and backend
const ROLE_MAPPING = {
  admin: 1,
  coordinator: 2,
  lecturer: 3,
  student: 4,
};

const REVERSE_ROLE_MAPPING = {
  1: "admin",
  2: "coordinator",
  3: "lecturer",
  4: "student",
};

const UserManagement = () => {
  const { user, token } = useAuth();

  // Data States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "admin",
    password: "",
  });

  // Fetch users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
        setLoading(false);
        setError(null);
      } catch (error) {
        setLoading(false);
        setError(
          error.response?.data?.message ||
            "Failed to fetch users. Please try again."
        );
      }
    };

    fetchData();
  }, [token]);

  // Form event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: ROLE_MAPPING[userFormData.role],
        password: userFormData.password,
      };

      const res = await axios.post(`${baseUrl}/users`, newUser, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers([...users, res.data]);
      resetForm();
      setError(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add user. Please check your inputs and try again."
      );
    }
  };

  // Update an existing user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: ROLE_MAPPING[userFormData.role],
      };

      // Only include password if it's not empty
      if (userFormData.password) {
        updatedUser.password = userFormData.password;
      }

      await axios.put(`${baseUrl}/users/${selectedUser._id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(
        users.map((u) =>
          u._id === selectedUser._id ? { ...u, ...updatedUser } : u
        )
      );
      resetForm();
      setSelectedUser(null);
      setError(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update user. Please try again."
      );
    }
  };

  // Delete a user
  // Delete a user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${baseUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((u) => u.id !== id));
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(null);
      }
      setError(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete user. Please try again."
      );
    }
  };

  // Reset the user form
  const resetForm = () => {
    setUserFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "admin",
      password: "",
    });
    setIsEditMode(false);
    setShowForm(false);
    setError(null);
  };

  // Get full name from first and last name
  const getFullName = (user) => {
    return `${user.firstName} ${user.lastName}`;
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const fullName = getFullName(u).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "all" || REVERSE_ROLE_MAPPING[u.role] === filterRole;
    return matchesSearch && matchesRole;
  });

  // Redirect non-admin users
  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-grow">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Only show filters and grid when no user is selected and no form is active */}
        {!selectedUser && !showForm && (
          <>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="student">Student</option>
                </select>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add New User
                </button>
              </div>
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500">
                No users found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {getFullName(u)}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Email:</span> {u.email}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Role:</span>{" "}
                      {REVERSE_ROLE_MAPPING[u.role]?.charAt(0).toUpperCase() +
                        REVERSE_ROLE_MAPPING[u.role]?.slice(1) || "Unknown"}
                    </p>

                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* User Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit User" : "Add New User"}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateUser : handleAddUser}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={userFormData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={userFormData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  minLength={isEditMode ? 0 : 6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder={
                    isEditMode
                      ? "Leave blank to keep current"
                      : "Enter password"
                  }
                />
                {!isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  {isEditMode ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User Detail View */}
        {selectedUser && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {getFullName(selectedUser)}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedUser.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {REVERSE_ROLE_MAPPING[selectedUser.role]
                  ?.charAt(0)
                  .toUpperCase() +
                  REVERSE_ROLE_MAPPING[selectedUser.role]?.slice(1) ||
                  "Unknown"}
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Users
              </button>
              <button
                onClick={() => {
                  setUserFormData({
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    email: selectedUser.email,
                    role: REVERSE_ROLE_MAPPING[selectedUser.role] || "admin",
                    password: "",
                  });
                  setIsEditMode(true);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit User
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
