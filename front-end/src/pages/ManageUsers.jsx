import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    status: "active",
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: "Jane Smith",
          email: "jane.smith@university.edu",
          role: "coordinator",
          department: "Administration",
          status: "active",
          lastLogin: "2025-03-12T09:15:00",
        },
        {
          id: 2,
          name: "John Doe",
          email: "john.doe@university.edu",
          role: "professor",
          department: "Computer Science",
          status: "active",
          lastLogin: "2025-03-13T14:30:00",
        },
        {
          id: 3,
          name: "Alice Johnson",
          email: "alice.johnson@university.edu",
          role: "student",
          department: "Physics",
          status: "active",
          lastLogin: "2025-03-10T11:45:00",
        },
        {
          id: 4,
          name: "Robert Chen",
          email: "robert.chen@university.edu",
          role: "student",
          department: "Mathematics",
          status: "inactive",
          lastLogin: "2025-02-28T16:20:00",
        },
        {
          id: 5,
          name: "Sarah Williams",
          email: "sarah.williams@university.edu",
          role: "professor",
          department: "Biology",
          status: "active",
          lastLogin: "2025-03-11T08:50:00",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // Only allow admin access
  if (user?.role !== "admin") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const userToAdd = {
      ...newUser,
      id: Date.now(),
      lastLogin: null,
    };
    setUsers([...users, userToAdd]);
    setNewUser({
      name: "",
      email: "",
      role: "student",
      department: "",
      status: "active",
    });
    setShowForm(false);
  };

  const handleEditUser = (id) => {
    const userToEdit = users.find((user) => user.id === id);
    setNewUser({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      department: userToEdit.department,
      status: userToEdit.status,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const updatedUsers = users.map((user) =>
      user.id === editingId
        ? {
            ...user,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            status: newUser.status,
          }
        : user
    );
    setUsers(updatedUsers);
    setNewUser({
      name: "",
      email: "",
      role: "student",
      department: "",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteUser = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (confirmed) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: user.status === "active" ? "inactive" : "active",
          }
        : user
    );
    setUsers(updatedUsers);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <p>Loading users...</p>;

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-black">User Management</h2>

      {/* Filters and search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none w-full md:w-64"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none w-full md:w-40"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="professor">Professor</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        <div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 w-full md:w-auto"
          >
            + Add New User
          </button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {showForm && (
        <div className="bg-white border-2 border-blue-700 w-full p-4 rounded-lg shadow text-black mb-6">
          <h3 className="text-xl font-bold mb-4 text-blue-700">
            {editingId ? "Edit User" : "Add New User"}
          </h3>
          <form onSubmit={editingId ? handleUpdateUser : handleAddUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={newUser.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newUser.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                {editingId ? "Update User" : "Add User"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setNewUser({
                    name: "",
                    email: "",
                    role: "student",
                    department: "",
                    status: "active",
                  });
                }}
                className="border-2 border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border-2 border-blue-700 w-full p-4 rounded-lg shadow text-black overflow-x-auto max-w-[100vw]">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">
            No users found matching your criteria.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "coordinator"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "professor"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.department}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`mr-2 px-2 py-1 rounded text-xs font-medium 
                        ${
                          user.status === "active"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk Actions and Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow text-black">
          <h3 className="font-bold mb-2">User Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-medium">
                {users.filter((u) => u.status === "active").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Inactive Users:</span>
              <span className="font-medium">
                {users.filter((u) => u.status === "inactive").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow text-black">
          <h3 className="font-bold mb-2">Role Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Admins:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "admin").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Coordinators:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "coordinator").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Professors:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "professor").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Students:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "student").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow text-black">
          <h3 className="font-bold mb-2">Bulk Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to export ${filteredUsers.length} users?`
                  )
                ) {
                  alert("Export functionality would be implemented here");
                }
              }}
              className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
            >
              Export Selected Users
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to send an email to all selected users?"
                  )
                ) {
                  alert("Email functionality would be implemented here");
                }
              }}
              className="w-full bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200"
            >
              Email Selected Users
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to deactivate all inactive users who haven't logged in for 30+ days?"
                  )
                ) {
                  // In a real app, implement this logic with real dates
                  alert("Account deactivation would be implemented here");
                }
              }}
              className="w-full bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200"
            >
              Deactivate Dormant Accounts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
