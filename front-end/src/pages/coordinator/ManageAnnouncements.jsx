import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const AnnouncementManagement = () => {
  const { user } = useAuth();

  // Data States
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: "",
    date: "",
    description: "",
    category: "Academic",
  });

  // Fetch announcements on mount
  useEffect(() => {
    axios
      .get(`${baseUrl}/announcements`)
      .then((response) => {
        setAnnouncements(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        setLoading(false);
      });
  }, []);

  // Form event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create a new announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const newAnnouncement = {
        ...announcementFormData,
        id: `ann${announcements.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      const res = await axios.post(`${baseUrl}/announcements`, newAnnouncement);
      setAnnouncements([...announcements, res.data]);
      resetForm();
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };

  // Update an existing announcement
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const updatedAnnouncement = {
        ...announcementFormData,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(
        `${baseUrl}/announcements/${selectedAnnouncement.id}`,
        updatedAnnouncement
      );
      setAnnouncements(
        announcements.map((announcement) =>
          announcement.id === selectedAnnouncement.id
            ? { ...announcement, ...updatedAnnouncement }
            : announcement
        )
      );
      resetForm();
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  // Delete an announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await axios.delete(`${baseUrl}/announcements/${id}`);
      setAnnouncements(
        announcements.filter((announcement) => announcement.id !== id)
      );
      if (selectedAnnouncement && selectedAnnouncement.id === id) {
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  // Open announcement for editing
  const handleEditAnnouncement = (announcement) => {
    setAnnouncementFormData({
      title: announcement.title,
      date: announcement.date,
      description: announcement.description,
      category: announcement.category || "Academic",
    });
    setSelectedAnnouncement(announcement);
    setIsEditMode(true);
    setShowForm(true);
  };

  // Reset the announcement form
  const resetForm = () => {
    setAnnouncementFormData({
      title: "",
      date: "",
      description: "",
      category: "Academic",
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  // Filter announcements based on search and category
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.description &&
        announcement.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || announcement.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Permission check
  if (user?.role !== "admin" && user?.role !== "coordinator") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading)
    return <p className="text-center p-4">Loading announcements...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
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
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Event">Event</option>
                </select>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700"
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedAnnouncement(announcement)}
                    >
                      {announcement.title}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Category:</span>{" "}
                      {announcement.category}
                    </p>

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

        {/* Announcement Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Announcement" : "Add New Announcement"}
            </h3>
            <form
              onSubmit={
                isEditMode ? handleUpdateAnnouncement : handleAddAnnouncement
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Title
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
                    Date
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
                    Category
                  </label>
                  <select
                    name="category"
                    value={announcementFormData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={announcementFormData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Provide details about the announcement"
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
                  {isEditMode ? "Update Announcement" : "Add Announcement"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcement Detail View */}
        {selectedAnnouncement && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedAnnouncement.title}
              </h2>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedAnnouncement.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {selectedAnnouncement.category}
              </p>
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {selectedAnnouncement.description}
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Announcements
              </button>
              <button
                onClick={() => handleEditAnnouncement(selectedAnnouncement)}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Announcement
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
