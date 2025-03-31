import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

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
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    departmentId: "",
    batchId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes, batchesRes] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/departments"),
          apiClient.get("/batches"),
        ]);

        setUsers(usersRes.data);
        setDepartments(departmentsRes.data);
        setBatches(batchesRes.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchData();
  }, []);

  console.log(token);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: ROLE_MAPPING[userFormData.role],
        departmentId: userFormData.departmentId,
        ...(userFormData.role === "student" && {
          enrolledBatchId: userFormData.batchId,
        }),
      };

      const response = await apiClient.post("/users", newUser);

      const createdUser = {
        ...response.data,
        department: departments.find(
          (d) => d.id === parseInt(userFormData.departmentId)
        ),
        ...(userFormData.role === "student" && {
          enrolledBatch: batches.find(
            (b) => b.id === parseInt(userFormData.batchId)
          ),
        }),
      };

      setUsers([...users, createdUser]);
      resetForm();
      toast.success(`User ${newUser.firstName} ${newUser.lastName} created`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add user";
      toast.error(errorMessage);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: ROLE_MAPPING[userFormData.role],
        departmentId: userFormData.departmentId,
        ...(userFormData.role === "student" && {
          batchId: userFormData.batchId,
        }),
      };

      // Only include password if it was provided
      if (userFormData.password) {
        updatedUser.password = userFormData.password;
      }

      const response = await apiClient.patch(
        `/users/${selectedUser.id}`,
        updatedUser
      );

      const updatedUserData = {
        ...selectedUser,
        ...updatedUser,
        department: departments.find(
          (d) => d.id === parseInt(userFormData.departmentId)
        ),
        enrolledBatch:
          userFormData.role === "student"
            ? batches.find((b) => b.id === parseInt(userFormData.batchId))
            : null,
      };

      setUsers(
        users.map((u) => (u.id === selectedUser.id ? updatedUserData : u))
      );
      resetForm();
      setSelectedUser(null);
      toast.success(
        `User ${updatedUser.firstName} ${updatedUser.lastName} updated`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setUserFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "admin",
      departmentId: "",
      batchId: "",
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  const getFullName = (user) => `${user.firstName} ${user.lastName}`;

  const filteredUsers = users.filter((u) => {
    const fullName = getFullName(u).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "all" || REVERSE_ROLE_MAPPING[u.role] === filterRole;
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading users...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!selectedUser && !showForm && (
          <>
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
                    <p className="text-gray-700">
                      <span className="font-semibold">Department:</span>{" "}
                      {u.department?.name || "Unknown"}
                    </p>
                    {u.role === ROLE_MAPPING.student && u.enrolledBatch && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Batch:</span>{" "}
                        {u.enrolledBatch.name}
                      </p>
                    )}
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

              {/* Only show password field in edit mode */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={userFormData.password || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to keep current password
                  </p>
                </div>
              )}

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="departmentId"
                  value={userFormData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">Select a Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {userFormData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    name="batchId"
                    value={userFormData.batchId}
                    onChange={handleInputChange}
                    required={userFormData.role === "student"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    <option value="">Select a batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
              <p>
                <span className="font-semibold">Department: </span>
                {selectedUser.department?.name ||
                  departments.find((d) => d.id === selectedUser.departmentId)
                    ?.name ||
                  "Unknown"}
              </p>
              {selectedUser.role === ROLE_MAPPING.student &&
                selectedUser.enrolledBatch && (
                  <p>
                    <span className="font-semibold">Batch:</span>{" "}
                    {selectedUser.enrolledBatch.name || "Unknown"}
                  </p>
                )}
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
                    departmentId: selectedUser.departmentId || "",
                    batchId: selectedUser.enrolledBatch?.id || "",
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
