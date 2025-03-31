import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import Announcements from "../../components/Announcements";
import CourseCompletionVisualization from "../../components/visualizations/CourseCompletionVisualization";
import RoleVisualizations from "../../components/visualizations/RoleVisualizations";

const LecDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [usersRes, coursesRes, modulesRes, batchesRes] =
          await Promise.all([
            apiClient.get("/users"),
            apiClient.get("/courses"),
            apiClient.get("/modules"),
            apiClient.get("/batches"),
          ]);

        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setModules(modulesRes.data);
        setBatches(batchesRes.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch dashboard data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchDashboardData();
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
    <div className="flex flex-col min-h-screen bg-white">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="container mx-auto flex flex-col flex-grow p-4">
        {/* User Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CourseCompletionVisualization
            courses={courses}
            modules={modules}
            users={users}
            batches={batches}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Courses:</span>
                <span className="font-medium text-blue-700">
                  {courses.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Modules:</span>
                <span className="font-medium text-green-600">
                  {modules.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Batches:</span>
                <span className="font-medium text-purple-600">
                  {batches.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-6">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default LecDashboard;
