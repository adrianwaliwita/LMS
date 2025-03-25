import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProfileSettings = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("general");
  const [profileImage, setProfileImage] = useState(null);

  // Default user profile structure
  const defaultProfile = {
    name: "",
    email: "",
    role: "",
    department: "Computer Science",
    joinDate: "2022-09-01",
    profileImage: null,
    preferences: {
      emailNotifications: true,
      darkMode: false,
      language: "English",
    },
  };

  // Sample data for different roles
  const roleProfiles = {
    admin: {
      name: "Admin User",
      department: "Administration",
      joinDate: "2020-01-15",
    },
    lecturer: {
      name: "Professor Smith",
      department: "Computer Science",
      joinDate: "2019-08-20",
    },
    student: {
      name: "Alex Johnson",
      department: "Computer Science",
      joinDate: "2022-09-01",
    },
    coordinator: {
      name: "Sam Wilson",
      department: "Event Management",
      joinDate: "2021-03-10",
    },
  };

  const [formData, setFormData] = useState({ ...defaultProfile });

  // Update form data when user changes
  useEffect(() => {
    if (user && user.role) {
      const roleSpecificData = roleProfiles[user.role] || {};
      setFormData({
        ...defaultProfile,
        ...roleSpecificData,
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const roleDescriptions = {
    admin: "Manage users, events, and view reports.",
    lecturer: "Manage your class schedule and assignments.",
    coordinator: "Approve events and manage resources.",
    student: "View your schedule and participate in events.",
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (preferences)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      // In a real app, you would upload this file to a server
    }
  };

  // Save profile changes
  const handleSaveChanges = () => {
    // In a real app, you would send this data to an API
    alert("Profile settings saved successfully!");
  };

  // If no user is logged in, show a message or redirect
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">
            Not Logged In
          </h1>
          <p className="text-gray-700 mb-4">
            Please log in to view your profile settings.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar - hidden on mobile, visible on md breakpoint and up */}

      {/* Profile content - full width on mobile, adjusted on larger screens */}
      <div className="w-full md:w-3/4 lg:w-4/5 px-4 md:px-6 py-6 md:py-10">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-blue-700">Profile Settings</h1>

          {/* Profile header with image and role info */}
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-blue-700">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-blue-700">
                      {formData.name.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-700 text-white p-2 rounded-full cursor-pointer hover:bg-blue-800 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-bold">{formData.name}</h2>
                <p className="text-gray-600">{formData.email}</p>
                <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {formData.role}
                </div>
                <p className="mt-2 text-gray-700">
                  {roleDescriptions[formData.role] || "User"}
                </p>
              </div>
            </div>
          </div>

          {/* Settings tabs */}
          <div className="flex border-b border-gray-200">
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

            {/* Admin-only tab */}
            {user.role === "admin" && (
              <button
                className={`py-3 px-6 font-medium ${
                  activeTab === "admin"
                    ? "text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                Admin Settings
              </button>
            )}
          </div>

          {/* Settings content */}
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            {activeTab === "general" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  General Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Join Date
                    </label>
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Security Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Admin-specific settings */}
            {activeTab === "admin" && user.role === "admin" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Admin Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      System Maintenance Mode
                    </label>
                    <div className="flex items-center">
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="maintenanceMode"
                          className="sr-only"
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner"></div>
                        <div className="absolute w-5 h-5 bg-white rounded-full shadow transform translate-x-0"></div>
                      </div>
                      <span>Off</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      User Registration
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="open">Open</option>
                      <option value="invite">Invite Only</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      System Notification
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter a system-wide notification message"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Role-specific content for lecturers */}
            {user.role === "lecturer" && activeTab === "general" && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  Lecturer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Faculty ID
                    </label>
                    <input
                      type="text"
                      value="FAC-2022-0451"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Office Hours
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mon-Wed 2-4pm"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Role-specific content for students */}
            {user.role === "student" && activeTab === "general" && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value="STU-2022-1845"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Academic Year
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>First Year</option>
                      <option>Second Year</option>
                      <option>Third Year</option>
                      <option>Fourth Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
