import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const UserManagement = () => {
  const { user } = useAuth();

  // Data States
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "student",
    departmentId: "",
  });

  // Fetch users and departments on mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/users`),
      axios.get(`${baseUrl}/departments`),
    ])
      .then(([usersRes, departmentsRes]) => {
        setUsers(usersRes.data);
        setDepartments(departmentsRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Helper function to get department name
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "No Department";
    const deptId = Array.isArray(departmentId) ? departmentId[0] : departmentId;
    const department = departments.find((dept) => dept.departmentId === deptId);
    return department ? department.departmentName : "Unknown Department";
  };

  // Form event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (e) => {
    const { value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      departmentId: value || null,
    }));
  };

  // Add a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        ...userFormData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await axios.post(`${baseUrl}/users`, newUser);
      setUsers([...users, res.data]);
      resetForm();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Update an existing user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ...userFormData,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(`${baseUrl}/users/${selectedUser.id}`, updatedUser);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...updatedUser } : u
        )
      );
      resetForm();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${baseUrl}/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Reset the user form
  const resetForm = () => {
    setUserFormData({
      name: "",
      email: "",
      role: "student",
      departmentId: "",
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(u.departmentId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Redirect non-admin users
  if (user?.role !== "admin") {
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
                    key={u.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {u.name}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Email:</span> {u.email}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Role:</span>{" "}
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter full name"
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
                  Role
                </label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={
                    Array.isArray(userFormData.departmentId)
                      ? userFormData.departmentId[0]
                      : userFormData.departmentId || ""
                  }
                  onChange={handleDepartmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
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
                {selectedUser.name}
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
                {selectedUser.role.charAt(0).toUpperCase() +
                  selectedUser.role.slice(1)}
              </p>
              <p>
                <span className="font-semibold">Department:</span>{" "}
                {getDepartmentName(selectedUser.departmentId)}
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
                    name: selectedUser.name,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    departmentId: selectedUser.departmentId || "",
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
