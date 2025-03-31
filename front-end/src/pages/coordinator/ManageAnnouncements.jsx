import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AnnouncementManagement = () => {
  const { user } = useAuth();

  // Data States
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: "",
    date: "",
    content: "",
    category: "ANNOUNCEMENT",
    targetBatchId: null,
  });

  // Fetch announcements and batches on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, batchesRes] = await Promise.all([
          apiClient.get("/announcements"),
          apiClient.get("/batches?status=ONGOING"),
        ]);
        setAnnouncements(announcementsRes.data);
        setBatches(batchesRes.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchData();
  }, []);

  // Form event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle batch selection change
  const handleBatchChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setAnnouncementFormData((prev) => ({
      ...prev,
      targetBatchId: value,
    }));
  };

  // Create a new announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const newAnnouncement = {
        ...announcementFormData,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      };
      const response = await apiClient.post("/announcements", newAnnouncement);
      setAnnouncements([...announcements, response.data]);
      resetForm();
      toast.success("Announcement added successfully!");
    } catch (error) {
      console.error("Error creating announcement:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Status Code:", error.response.status);
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please try again.");
      } else {
        console.error("Request error:", error.message);
        toast.error("Unexpected error occurred.");
      }
    }
  };

  // Delete an announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await apiClient.delete(`/announcements/${id}`);
      setAnnouncements(
        announcements.filter((announcement) => announcement.id !== id)
      );
      if (selectedAnnouncement && selectedAnnouncement.id === id) {
        setSelectedAnnouncement(null);
      }
      toast.success("Announcement deleted successfully!");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      if (error.response) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  // Reset the announcement form
  const resetForm = () => {
    setAnnouncementFormData({
      title: "",
      date: "",
      content: "",
      category: "ANNOUNCEMENT",
      targetBatchId: null,
    });
    setShowForm(false);
  };

  // Filter announcements based on search and category
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.content &&
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || announcement.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading)
    return <p className="text-center p-4">Loading announcements...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Announcement Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-grow">
        {/* Only show filters and grid when no announcement is selected and no form is active */}
        {!selectedAnnouncement && !showForm && (
          <>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <div className="flex gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="EVENT">Event</option>
                </select>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  + Add New Announcement
                </button>
              </div>
            </div>

            {/* Announcements Grid */}
            {filteredAnnouncements.length === 0 ? (
              <p className="text-center text-gray-500">
                No announcements found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`border-2 ${
                      announcement.category === "EVENT"
                        ? "border-green-600"
                        : "border-blue-700"
                    } bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow `}
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-lg font-semibold cursor-pointer"
                        style={{
                          color:
                            announcement.category === "EVENT"
                              ? "#059669"
                              : "#1d4ed8",
                        }}
                        onClick={() => setSelectedAnnouncement(announcement)}
                      >
                        {announcement.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          announcement.category === "EVENT"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {announcement.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Posted:</span>{" "}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                    {announcement.targetBatchId && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Target Batch:</span>{" "}
                        {announcement.batch?.name || "Batch not found"}
                      </p>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Announcement Add Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Add New Announcement
            </h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={announcementFormData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="e.g., Spring Semester Registration Opens"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={announcementFormData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={announcementFormData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    required
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Batch (optional)
                </label>
                <select
                  name="targetBatchId"
                  value={announcementFormData.targetBatchId || null}
                  onChange={handleBatchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Select a batch --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={announcementFormData.content}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Provide details about the announcement/event"
                ></textarea>
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
                  Add Announcement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcement Detail View */}
        {selectedAnnouncement && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedAnnouncement.title}
                </h2>
                <span
                  className={`text-sm px-2 py-1 rounded mt-1 inline-block ${
                    selectedAnnouncement.category === "EVENT"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedAnnouncement.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Posted:</span>{" "}
                {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
              </p>
              {selectedAnnouncement.date && (
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </p>
              )}
              {selectedAnnouncement.targetBatchId && (
                <p>
                  <span className="font-semibold">Target Batch:</span>{" "}
                  {selectedAnnouncement.batch?.name || "Batch not found"}
                </p>
              )}
              <div>
                <span className="font-semibold">Content:</span>
                <p className="mt-1 whitespace-pre-line">
                  {selectedAnnouncement.content}
                </p>
              </div>
              {selectedAnnouncement.creator && (
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Posted by:</span>{" "}
                  {selectedAnnouncement.creator.firstName}{" "}
                  {selectedAnnouncement.creator.lastName}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Announcements
              </button>
              <button
                onClick={() =>
                  handleDeleteAnnouncement(selectedAnnouncement.id)
                }
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Announcement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;
