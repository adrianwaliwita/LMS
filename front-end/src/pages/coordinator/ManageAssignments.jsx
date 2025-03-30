import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

const AssignmentIssuer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); // 'create' or 'view'

  const [formData, setFormData] = useState({
    batchId: "",
    courseId: "",
    moduleId: "",
    title: "",
    description: "",
    dueDate: "",
    briefFile: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, coursesRes, assignmentsRes] = await Promise.all([
          apiClient.get("/batches"),
          apiClient.get("/courses?includeModules=true"),
          apiClient.get("/assignments?includeDetails=true"),
        ]);

        setBatches(batchesRes.data);
        setCourses(coursesRes.data);
        setAssignments(assignmentsRes.data);

        // Extract all modules from courses
        const allModules = coursesRes.data.flatMap(
          (course) =>
            course.modules?.map((module) => ({
              ...module,
              courseId: course.id,
              courseTitle: course.title,
            })) || []
        );

        setModules(allModules);
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

  useEffect(() => {
    if (formData.courseId) {
      const filtered = modules.filter(
        (module) => module.courseId === parseInt(formData.courseId)
      );
      setFilteredModules(filtered);
      setFormData((prev) => ({ ...prev, moduleId: "" }));
    } else {
      setFilteredModules([]);
    }
  }, [formData.courseId, modules]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, briefFile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jsonPayload = {
        batchId: parseInt(formData.batchId, 10),
        moduleId: parseInt(formData.moduleId, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      const response = await apiClient.post("/assignments", jsonPayload, {
        headers: { "Content-Type": "application/json" },
      });

      const assignmentId = response.data.id;

      if (formData.briefFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", formData.briefFile);

        await apiClient.post(
          `/assignments/${assignmentId}/upload-brief`,
          fileFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      // Refresh assignments list
      const updatedAssignments = await apiClient.get(
        "/assignments?includeDetails=true"
      );
      setAssignments(updatedAssignments.data);

      toast.success("Assignment created successfully!");
      setFormData({
        batchId: "",
        courseId: "",
        moduleId: "",
        title: "",
        description: "",
        dueDate: "",
        briefFile: null,
      });
      setActiveTab("view"); // Switch to view tab after creation
    } catch (error) {
      console.error("Error creating assignment:", error); // Log full error object

      if (error.response) {
        // Server responded with a status code outside 2xx
        console.error("Response Data:", error.response.data);
        console.error("Status Code:", error.response.status);
        console.error("Headers:", error.response.headers);

        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        // Request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("No response from server. Please try again.");
      } else {
        // Something else happened (e.g., network error)
        console.error("Request error:", error.message);
        toast.error("Unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadBrief = async (assignmentId) => {
    try {
      const response = await apiClient.get(
        `/assignments/${assignmentId}/download-brief`,
        {
          responseType: "blob",
        }
      );

      // Extract filename from content-disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "assignment_brief.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(
        "Failed to download brief: " +
          (error.response?.data?.message || "File not found")
      );
    }
  };

  if (loading) return <p className="text-center p-4">Loading data...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="container mx-auto flex flex-col flex-grow p-4">
        <header className="bg-blue-700 text-white p-4 shadow rounded-xl mb-6">
          <h1 className="text-2xl font-bold">Assignment Management</h1>
        </header>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "create"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create Assignment
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === "view"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("view")}
          >
            View Assignments ({assignments.length})
          </button>
        </div>

        {activeTab === "create" ? (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields remain the same as before */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Batch
                  </label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} (
                        {new Date(batch.startDate).toLocaleDateString()} -{" "}
                        {new Date(batch.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Course
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.levelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Module
                  </label>
                  <select
                    name="moduleId"
                    value={formData.moduleId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.courseId}
                  >
                    <option value="">
                      {formData.courseId
                        ? "Select Module"
                        : "Select Course first"}
                    </option>
                    {filteredModules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Assignment Brief (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      batchId: "",
                      courseId: "",
                      moduleId: "",
                      title: "",
                      description: "",
                      dueDate: "",
                      briefFile: null,
                    })
                  }
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:bg-blue-400"
                >
                  {isSubmitting ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Issued Assignments
            </h2>

            {assignments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No assignments have been created yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignment.title}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.module?.title || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.batch?.name || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assignment.dueDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => downloadBrief(assignment.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Brief"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentIssuer;
