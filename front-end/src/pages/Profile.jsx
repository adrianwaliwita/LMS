import React, { useState, useEffect } from "react";
import { useAuth } from "./../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../api/apiClient";

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: 0,
    roleName: "",
    departmentId: 0,
    department: {},
    enrolledBatch: null,
    assignedModules: [],
    createdAt: "",
    updatedAt: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const [profileRes, departmentsRes, batchesRes] = await Promise.all([
            apiClient.get(`/users/${user.id}`),
            apiClient.get("/departments"),
            user.role === ROLE_MAPPING.student
              ? apiClient.get("/batches")
              : Promise.resolve(null),
          ]);

          const userData = profileRes.data;
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            role: userData.role || 0,
            roleName: userData.roleName || "",
            departmentId: userData.departmentId || 0,
            department: userData.department || {},
            enrolledBatch: userData.enrolledBatch || null,
            assignedModules: userData.assignedModules || [],
            createdAt: userData.createdAt || "",
            updatedAt: userData.updatedAt || "",
          });

          setDepartments(departmentsRes.data);
          if (batchesRes) {
            setBatches(batchesRes.data);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch profile data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId,
        ...(formData.role === ROLE_MAPPING.student && {
          batchId: formData.enrolledBatch?.id || null,
        }),
      };

      const response = await apiClient.patch(`/users/${user.id}`, updatedData);

      // Update user context
      updateUser(response.data);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await apiClient.patch(`/users/${user.id}`, {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      });

      toast.success("Password updated successfully");
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || 0,
        roleName: user.roleName || "",
        departmentId: user.departmentId || 0,
        department: user.department || {},
        enrolledBatch: user.enrolledBatch || null,
        assignedModules: user.assignedModules || [],
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
      });
    }
  };

  const handleCancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (loading)
    return <p className="text-center p-4">Loading profile data...</p>;

  if (!user) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You need to be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>
      </header>

      <div className="container mx-auto flex flex-col flex-grow p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative"></div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-blue-700 mb-1">
                    {`${formData.firstName} ${formData.lastName}`}
                  </h2>
                  <p className="text-gray-600">{formData.email}</p>
                  <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {formData.roleName}
                  </div>
                </div>
                {!isEditing && activeTab === "general" && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    Edit Profile
                  </button>
                )}
                {!isEditingPassword && activeTab === "security" && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "general"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "security"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">
                General Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        First Name
                      </label>
                      <p>{formData.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Last Name
                      </label>
                      <p>{formData.lastName}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <p>{formData.email}</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>
                      {formData.department?.name || "No department assigned"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Member Since
                  </label>
                  <p>{new Date(formData.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Last Updated
                  </label>
                  <p>{new Date(formData.updatedAt).toLocaleDateString()}</p>
                </div>
                {formData.role === ROLE_MAPPING.student &&
                  formData.enrolledBatch && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Batch
                      </label>
                      {isEditing ? (
                        <select
                          name="batchId"
                          value={formData.enrolledBatch?.id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              enrolledBatch: batches.find(
                                (b) => b.id === parseInt(e.target.value)
                              ),
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Batch</option>
                          {batches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                              {batch.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p>{formData.enrolledBatch.name}</p>
                      )}
                    </div>
                  )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700">
                Security Settings
              </h3>

              {isEditingPassword ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        minLength="6"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        minLength="6"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancelPasswordEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordUpdate}
                      className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                      Update Password
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800">
                    Password last changed:{" "}
                    {new Date(formData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "modules" &&
            formData.role === ROLE_MAPPING.lecturer && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Assigned Modules
                </h3>

                {formData.assignedModules.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {formData.assignedModules.map((module) => (
                      <div
                        key={module.id}
                        className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-lg font-semibold text-blue-700">
                          {module.name}
                        </h3>
                        <p className="text-gray-700 mt-2">
                          <span className="font-semibold">Code:</span>{" "}
                          {module.code}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Credit Hours:</span>{" "}
                          {module.creditHours}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No modules assigned</p>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
