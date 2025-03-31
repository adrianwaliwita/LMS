import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

const COURSE_CATEGORIES = {
  1: "IT",
  2: "Business",
  3: "Engineering",
  4: "Arts",
  5: "Science",
};

const COURSE_LEVELS = {
  1: "Diploma",
  2: "Bachelor",
  3: "Master",
  4: "PhD",
};

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    category: 1,
    level: 1,
    price: null,
    departmentId: "",
    moduleIds: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, departmentsRes, modulesRes] = await Promise.all([
          apiClient.get("/courses"),
          apiClient.get("/departments"),
          apiClient.get("/modules"),
        ]);

        setCourses(coursesRes.data);
        setDepartments(departmentsRes.data);
        setModules(modulesRes.data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleModuleSelection = (e) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setCourseFormData((prev) => ({
      ...prev,
      moduleIds: options,
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      // Convert moduleIds to numbers and price to number or null
      const formData = {
        ...courseFormData,
        moduleIds: courseFormData.moduleIds.map((id) => Number(id)),
        price: courseFormData.price ? Number(courseFormData.price) : null,
      };
      const response = await apiClient.post("/courses", formData);
      setCourses([...courses, response.data]);
      resetForm();
      toast.success(`Course ${courseFormData.title} created successfully`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create course";
      toast.error(errorMessage);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      // Convert moduleIds to numbers and price to number or null
      const formData = {
        ...courseFormData,
        moduleIds: courseFormData.moduleIds.map((id) => Number(id)),
        price: courseFormData.price ? Number(courseFormData.price) : null,
      };
      const response = await apiClient.patch(
        `/courses/${selectedCourse.id}`,
        formData
      );

      const updatedCourses = courses.map((course) =>
        course.id === selectedCourse.id ? response.data : course
      );

      setCourses(updatedCourses);
      resetForm();
      setSelectedCourse(null);
      toast.success(`Course ${courseFormData.title} updated successfully`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update course";
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await apiClient.delete(`/courses/${id}`);
      setCourses(courses.filter((course) => course.id !== id));
      if (selectedCourse?.id === id) setSelectedCourse(null);
      toast.success("Course deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete course";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      category: 1,
      level: 1,
      price: null,
      departmentId: "",
      moduleIds: [],
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  const handleEditSetup = (course) => {
    setCourseFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      departmentId: course.departmentId,
      moduleIds: course.modules?.map((m) => m.id) || [],
    });
    setSelectedCourse(course);
    setIsEditMode(true);
    setShowForm(true);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || course.category.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading courses...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!selectedCourse && !showForm && (
          <>
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
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(COURSE_CATEGORIES).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
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
                      {course.title}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Category:</span>{" "}
                      {COURSE_CATEGORIES[course.category] || "Unknown"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Level:</span>{" "}
                      {COURSE_LEVELS[course.level] || "Unknown"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Price:</span>{" "}
                      {course.price === null
                        ? "Free"
                        : `$${course.price.toFixed(2)}`}
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

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Course" : "Add New Course"}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateCourse : handleCreateCourse}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseFormData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={courseFormData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  rows="3"
                  placeholder="Course description"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={courseFormData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    {Object.entries(COURSE_CATEGORIES).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={courseFormData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    {Object.entries(COURSE_LEVELS).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (leave empty for free)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={courseFormData.price || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter price (0 for free)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={courseFormData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules
                </label>
                <select
                  multiple
                  value={courseFormData.moduleIds}
                  onChange={handleModuleSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none h-32"
                >
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
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

        {selectedCourse && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedCourse.title}
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
                {selectedCourse.description || "No description available"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {COURSE_CATEGORIES[selectedCourse.category] || "Unknown"}
                  </p>
                  <p>
                    <span className="font-semibold">Level:</span>{" "}
                    {COURSE_LEVELS[selectedCourse.level] || "Unknown"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Department:</span>{" "}
                    {selectedCourse.department?.name || "Unknown"}
                  </p>
                  <p>
                    <span className="font-semibold">Price:</span>{" "}
                    {selectedCourse.price === null
                      ? "Free"
                      : `$${selectedCourse.price.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Modules</h3>
                {selectedCourse.modules?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Title
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedCourse.modules.map((module) => (
                          <tr key={module.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {module.title}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {module.description || "No description"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No modules assigned to this course
                  </p>
                )}
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
                onClick={() => handleEditSetup(selectedCourse)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
