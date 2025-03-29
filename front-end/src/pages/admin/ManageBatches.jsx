import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

const BATCH_STATUS = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

const BatchManagement = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [batchFormData, setBatchFormData] = useState({
    name: "",
    courseId: "",
    startDate: "",
    endDate: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, coursesRes, usersRes] = await Promise.all([
          apiClient.get("/batches"),
          apiClient.get("/courses"),
          apiClient.get("/users"),
        ]);

        setBatches(batchesRes.data);
        setCourses(coursesRes.data);
        setAllUsers(usersRes.data);
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

  // Get students for a specific batch
  const getStudentsForBatch = (batchId) => {
    return allUsers.filter(
      (user) => user.role === 4 && user.enrolledBatch?.id === batchId
    );
  };

  // Get student count for a batch
  const getStudentCount = (batchId) => {
    return getStudentsForBatch(batchId).length;
  };

  const handleBatchClick = (batch) => {
    setSelectedBatch({
      ...batch,
      students: getStudentsForBatch(batch.id),
    });
    setShowForm(false);
  };

  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setBatchFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/batches", batchFormData);
      setBatches([...batches, response.data]);
      resetBatchForm();
      setShowForm(false);
      toast.success(`Batch ${batchFormData.name} created successfully`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create batch";
      toast.error(errorMessage);
    }
  };

  const handleEditBatchSetup = (batch) => {
    setBatchFormData({
      name: batch.name,
      courseId: batch.courseId,
      startDate: batch.startDate.split("T")[0],
      endDate: batch.endDate ? batch.endDate.split("T")[0] : "",
      status: batch.status,
    });
    setSelectedBatch({
      ...batch,
      students: getStudentsForBatch(batch.id),
    });
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.patch(
        `/batches/${selectedBatch.id}`,
        batchFormData
      );

      const updatedBatches = batches.map((batch) =>
        batch.id === selectedBatch.id ? response.data : batch
      );

      setBatches(updatedBatches);
      resetBatchForm();
      setShowForm(false);
      setIsEditMode(false);
      toast.success(`Batch ${batchFormData.name} updated successfully`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update batch";
      toast.error(errorMessage);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await apiClient.delete(`/batches/${id}`);
      setBatches(batches.filter((batch) => batch.id !== id));
      if (selectedBatch?.id === id) setSelectedBatch(null);
      toast.success("Batch deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete batch";
      toast.error(errorMessage);
    }
  };

  const resetBatchForm = () => {
    setBatchFormData({
      name: "",
      courseId: "",
      startDate: "",
      endDate: "",
      status: "UPCOMING",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditMode(false);
    resetBatchForm();
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.course?.title &&
        batch.course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading data...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Batch Management</h1>
        </div>
      </header>

      <div className="container mx-auto flex flex-col flex-grow p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search batches..."
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {!showForm && !selectedBatch && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => {
                setShowForm(true);
                setIsEditMode(false);
                resetBatchForm();
              }}
            >
              Create New Batch
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Batch" : "Create New Batch"}
            </h3>

            <form
              onSubmit={isEditMode ? handleUpdateBatch : handleCreateBatch}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={batchFormData.name}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="e.g., Batch 2023"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  name="courseId"
                  value={batchFormData.courseId}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={batchFormData.startDate}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={batchFormData.endDate}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={batchFormData.status}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  required
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {isEditMode ? "Save Changes" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!selectedBatch && !showForm ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  No batches found matching your search.
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => handleBatchClick(batch)}
                    >
                      {batch.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        batch.status === "UPCOMING"
                          ? "bg-yellow-100 text-yellow-800"
                          : batch.status === "ONGOING"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {BATCH_STATUS[batch.status] || batch.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">
                    <span className="font-semibold">Course:</span>{" "}
                    {batch.course?.title || "No course assigned"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Students:</span>{" "}
                    {getStudentCount(batch.id)}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={() => handleBatchClick(batch)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Manage Batch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : selectedBatch && !showForm ? (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedBatch.name}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedBatch.status === "UPCOMING"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedBatch.status === "ONGOING"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {BATCH_STATUS[selectedBatch.status] || selectedBatch.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Course Information</h3>
                  {selectedBatch.course ? (
                    <>
                      <p>
                        <span className="font-semibold">Title:</span>{" "}
                        {selectedBatch.course.title}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span>{" "}
                        {selectedBatch.course.categoryName}
                      </p>
                      <p>
                        <span className="font-semibold">Level:</span>{" "}
                        {selectedBatch.course.levelName}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No course assigned</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">Schedule</h3>
                  <p>
                    <span className="font-semibold">Start Date:</span>{" "}
                    {new Date(selectedBatch.startDate).toLocaleDateString()}
                  </p>
                  {selectedBatch.endDate && (
                    <p>
                      <span className="font-semibold">End Date:</span>{" "}
                      {new Date(selectedBatch.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">
                    Students ({selectedBatch.students?.length || 0})
                  </h3>
                </div>

                {selectedBatch.students?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Department
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBatch.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {`${student.firstName} ${student.lastName}`}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {student.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {student.department?.name || "Unknown"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No students enrolled in this batch.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setSelectedBatch(null)}
              >
                Back to Batches
              </button>
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                onClick={() => handleEditBatchSetup(selectedBatch)}
              >
                Edit Batch
              </button>
              <button
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                onClick={() => handleDeleteBatch(selectedBatch.id)}
              >
                Delete Batch
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BatchManagement;
