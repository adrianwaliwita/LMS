import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import Announcements from "../../components/Announcements";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get("/users");
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch users";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchUsers();
  }, []);

  // Role mapping for display
  const roleMap = {
    1: "Admin",
    2: "Coordinator",
    3: "Professor",
    4: "Student",
  };

  if (loading)
    return <p className="text-center p-4">Loading dashboard data...</p>;

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="container mx-auto flex flex-col flex-grow p-4">
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Statistics Card */}
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              User Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Users:</span>
                <span className="font-medium text-blue-700">
                  {users.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Active Users:</span>
                <span className="font-medium text-green-600">
                  {users.filter((u) => u.status === "active").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Inactive Users:</span>
                <span className="font-medium text-red-600">
                  {users.filter((u) => u.status === "inactive").length}
                </span>
              </div>
            </div>
          </div>

          {/* Role Distribution Card */}
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              Role Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(roleMap).map(([roleId, roleName]) => (
                <div key={roleId} className="flex justify-between items-center">
                  <span className="text-gray-700">{roleName}s:</span>
                  <span className="font-medium text-blue-700">
                    {users.filter((u) => u.role === parseInt(roleId)).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity or Other Dashboard Widgets */}

        {/* Announcements Section */}
        <div className="mt-6">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
