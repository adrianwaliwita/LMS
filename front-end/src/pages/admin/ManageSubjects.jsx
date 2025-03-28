import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const SubjectManagement = () => {
  const { user } = useAuth();

  // Data States
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    description: "",
    credits: 0,
    courseIds: [],
  });

  // Fetch subjects and courses on mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/subjects`),
      axios.get(`${baseUrl}/courses`),
    ])
      .then(([subjectsRes, coursesRes]) => {
        setSubjects(subjectsRes.data);
        setCourses(coursesRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Form event handlers
  const handleSubjectInputChange = (e) => {
    const { name, value, type, options } = e.target;
    if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setSubjectFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));
    } else {
      setSubjectFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Create a new subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const newSubject = {
        ...subjectFormData,
        id: `mod${subjects.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await axios.post(`${baseUrl}/subjects`, newSubject);
      setSubjects([...subjects, res.data]);
      resetForm();
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  // Update an existing subject
  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      const updatedSubject = {
        ...subjectFormData,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(
        `${baseUrl}/subjects/${selectedSubject.id}`,
        updatedSubject
      );
      setSubjects(
        subjects.map((subject) =>
          subject.id === selectedSubject.id
            ? { ...subject, ...updatedSubject }
            : subject
        )
      );
      resetForm();
      setSelectedSubject(null);
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  // Delete a subject
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;
    try {
      await axios.delete(`${baseUrl}/subjects/${id}`);
      setSubjects(subjects.filter((subject) => subject.id !== id));
      if (selectedSubject && selectedSubject.id === id) {
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // Open subject for editing
  const handleEditSubject = (subject) => {
    setSubjectFormData({
      name: subject.name,
      description: subject.description,
      credits: subject.credits || 0,
      courseIds: subject.courseIds || [],
    });
    setSelectedSubject(subject);
    setIsEditMode(true);
    setShowForm(true);
  };

  // Reset the subject form
  const resetForm = () => {
    setSubjectFormData({
      name: "",
      description: "",
      credits: 0,
      courseIds: [],
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  // Filter subjects based on search and course
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description &&
        subject.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse =
      filterCourse === "all" || subject.courseIds?.includes(filterCourse);
    return matchesSearch && matchesCourse;
  });

  if (loading) return <p className="text-center p-4">Loading subjects...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Subject Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-grow">
        {/* Only show filters and grid when no subject is selected and no form is active */}
        {!selectedSubject && !showForm && (
          <>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <div className="flex gap-4">
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add New Subject
                </button>
              </div>
            </div>

            {/* Subjects Grid */}
            {filteredSubjects.length === 0 ? (
              <p className="text-center text-gray-500">
                No subjects found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject.name}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Credits:</span>{" "}
                      {subject.credits || 0}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Courses:</span>{" "}
                      {subject.courseIds?.length > 0
                        ? subject.courseIds
                            .map(
                              (id) =>
                                courses.find((c) => c.id === id)?.name ||
                                "Unknown Course"
                            )
                            .join(", ")
                        : "Not Assigned"}
                    </p>

                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedSubject(subject)}
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

        {/* Subject Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Subject" : "Add New Subject"}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateSubject : handleAddSubject}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={subjectFormData.name}
                  onChange={handleSubjectInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="e.g., Advanced Python Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={subjectFormData.description}
                  onChange={handleSubjectInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Subject description"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    name="credits"
                    value={subjectFormData.credits}
                    onChange={handleSubjectInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associated Courses
                  </label>
                  <select
                    name="courseIds"
                    multiple
                    value={subjectFormData.courseIds}
                    onChange={handleSubjectInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {isEditMode ? "Update Subject" : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subject Detail View */}
        {selectedSubject && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedSubject.name}
              </h2>
              <button
                onClick={() => setSelectedSubject(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {selectedSubject.description || "No description provided."}
              </p>
              <p>
                <span className="font-semibold">Credits:</span>{" "}
                {selectedSubject.credits || 0}
              </p>
              <p>
                <span className="font-semibold">Courses:</span>{" "}
                {selectedSubject.courseIds?.length > 0
                  ? selectedSubject.courseIds
                      .map(
                        (id) =>
                          courses.find((c) => c.id === id)?.name ||
                          "Unknown Course"
                      )
                      .join(", ")
                  : "Not Assigned"}
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Subjects
              </button>
              <button
                onClick={() => handleEditSubject(selectedSubject)}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Subject
              </button>
              <button
                onClick={() => handleDeleteSubject(selectedSubject.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Subject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
