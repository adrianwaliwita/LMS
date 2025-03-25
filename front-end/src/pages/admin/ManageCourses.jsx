import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const CourseManagement = () => {
  const { user } = useAuth();

  // Data States
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    name: "",
    description: "",
    SubjectIds: [],
    BatchIds: [],
    totalCredits: 0,
    isActive: true,
  });
  const [showBatchAssignForm, setShowBatchAssignForm] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  // Fetch courses, subjects, batches, and students on mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/courses`),
      axios.get(`${baseUrl}/subjects`),
      axios.get(`${baseUrl}/batches`),
      axios.get(`${baseUrl}/users?role=student`),
    ])
      .then(([coursesRes, subjectsRes, batchesRes, studentsRes]) => {
        setCourses(coursesRes.data);
        setSubjects(subjectsRes.data);
        setBatches(batchesRes.data);
        setStudents(studentsRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getNames = (ids, items, prop = "name") => {
    if (!ids || !ids.length) return "None";
    return ids
      .map((id) => items.find((item) => item.id === id)?.[prop] || "Unknown")
      .join(", ");
  };

  // Form event handlers
  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectsChange = (e) => {
    const SubjectIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    const totalCredits = subjects
      .filter((subject) => SubjectIds.includes(subject.id))
      .reduce((sum, subject) => sum + (subject.credits || 0), 0);
    setCourseFormData((prev) => ({
      ...prev,
      SubjectIds,
      totalCredits,
    }));
  };

  const handleBatchesChange = (e) => {
    const BatchIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setCourseFormData((prev) => ({
      ...prev,
      BatchIds,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Create a new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const newCourse = {
        ...courseFormData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await axios.post(`${baseUrl}/courses`, newCourse);
      setCourses([...courses, res.data]);
      resetForm();
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  // Update an existing course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const updatedCourse = {
        ...courseFormData,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(`${baseUrl}/courses/${selectedCourse.id}`, updatedCourse);
      setCourses(
        courses.map((course) =>
          course.id === selectedCourse.id
            ? { ...course, ...updatedCourse }
            : course
        )
      );
      resetForm();
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  // Delete a course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${baseUrl}/courses/${id}`);
      setCourses(courses.filter((course) => course.id !== id));
      if (selectedCourse && selectedCourse.id === id) {
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Open course for editing
  const handleEditCourse = (course) => {
    setCourseFormData({
      name: course.name,
      description: course.description,
      SubjectIds: course.SubjectIds || [],
      BatchIds: course.BatchIds || [],
      totalCredits: course.totalCredits || 0,
      isActive: course.isActive,
    });
    setSelectedCourse(course);
    setIsEditMode(true);
    setShowForm(true);
    setShowBatchAssignForm(false);
  };

  // Open batch assignment form
  const handleBatchAssignment = (course) => {
    setSelectedCourse(course);
    setSelectedBatches(course.BatchIds || []);
    setShowBatchAssignForm(true);
    setShowForm(false);
  };

  // Assign batches to a course
  const handleAssignBatches = async (e) => {
    e.preventDefault();
    try {
      const updatedCourse = {
        ...selectedCourse,
        BatchIds: selectedBatches,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(`${baseUrl}/courses/${selectedCourse.id}`, updatedCourse);
      setCourses(
        courses.map((course) =>
          course.id === selectedCourse.id ? updatedCourse : course
        )
      );
      setShowBatchAssignForm(false);
      setSelectedCourse(null);
      setSelectedBatches([]);
    } catch (error) {
      console.error("Error assigning batches:", error);
    }
  };

  // Reset the course form
  const resetForm = () => {
    setCourseFormData({
      name: "",
      description: "",
      SubjectIds: [],
      BatchIds: [],
      totalCredits: 0,
      isActive: true,
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  // Filter courses based on search and active status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && course.isActive) ||
      (filterActive === "inactive" && !course.isActive);
    return matchesSearch && matchesActive;
  });

  if (user?.role !== "admin") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading courses...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-grow">
        {/* Only show filters and grid when no course is selected and no form is active */}
        {!selectedCourse && !showForm && !showBatchAssignForm && (
          <>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <div className="flex gap-4">
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="all">All Courses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => {
                    resetForm();

                    setShowForm(true);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add New Course
                </button>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
              <p className="text-center text-gray-500">
                No courses found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      {course.name}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Credits:</span>{" "}
                      {course.totalCredits || 0}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Status:</span>{" "}
                      {course.isActive ? "Active" : "Inactive"}
                    </p>

                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Course Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Course" : "Add New Course"}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateCourse : handleAddCourse}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={courseFormData.name}
                  onChange={handleCourseInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={courseFormData.description}
                  onChange={handleCourseInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Course description"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects
                </label>
                <select
                  multiple
                  value={courseFormData.SubjectIds}
                  onChange={handleSubjectsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none h-32"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.credits || 0} credits)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batches
                </label>
                <select
                  multiple
                  value={courseFormData.BatchIds}
                  onChange={handleBatchesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none h-32"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} (Start: {formatDate(batch.startDate)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={courseFormData.isActive}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active Course
                </label>
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
                  {isEditMode ? "Update Course" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Batch Assignment Form */}
        {showBatchAssignForm && selectedCourse && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Assign Batches to {selectedCourse.name}
            </h3>
            <form onSubmit={handleAssignBatches} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Batches
                </label>
                <select
                  multiple
                  value={selectedBatches}
                  onChange={(e) =>
                    setSelectedBatches(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none h-32"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} (Start: {formatDate(batch.startDate)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchAssignForm(false);
                    setSelectedCourse(null);
                    setSelectedBatches([]);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Assign Batches
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Course Detail View */}
        {selectedCourse && !showForm && !showBatchAssignForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedCourse.name}
              </h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {selectedCourse.description || "No description provided."}
              </p>
              <p>
                <span className="font-semibold">Total Credits:</span>{" "}
                {selectedCourse.totalCredits || 0}
              </p>
              <p>
                <span className="font-semibold">Subjects:</span>{" "}
                {getNames(selectedCourse.SubjectIds, subjects)}
              </p>
              <div>
                <h3 className="font-semibold mb-2">Batches:</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Start Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCourse.BatchIds &&
                      selectedCourse.BatchIds.length > 0 ? (
                        selectedCourse.BatchIds.map((batchId) => {
                          const batch = batches.find((b) => b.id === batchId);
                          if (!batch) return null;
                          return (
                            <tr key={batch.id}>
                              <td className="px-4 py-2">{batch.name}</td>
                              <td className="px-4 py-2">
                                {formatDate(batch.startDate)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-4 py-2 text-center text-gray-500"
                          >
                            No batches assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Courses
              </button>
              <button
                onClick={() => {
                  setCourseFormData({
                    name: selectedCourse.name,
                    description: selectedCourse.description,
                    SubjectIds: selectedCourse.SubjectIds || [],
                    BatchIds: selectedCourse.BatchIds || [],
                    totalCredits: selectedCourse.totalCredits || 0,
                    isActive: selectedCourse.isActive,
                  });
                  setIsEditMode(true);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Course
              </button>
              <button
                onClick={() => handleDeleteCourse(selectedCourse.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Course
              </button>
              <button
                onClick={() => {
                  setSelectedBatches(selectedCourse.BatchIds || []);
                  setShowBatchAssignForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Assign Batches
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
