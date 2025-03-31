import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

// Keep mappings for potential reference or future needs, but only 'student' will be actively used.
const ROLE_MAPPING = {
  admin: 1,
  coordinator: 2,
  lecturer: 3,
  student: 4,
};

const REVERSE_ROLE_MAPPING = {
  1: "admin",
  2: "coordinator",
  3: "lecturer",
  4: "student",
};

const StudentManagement = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [students, setStudents] = useState([]); // Derived state for only students
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  // Removed modules state as it's not needed for students
  // const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed filterRole state
  // const [filterRole, setFilterRole] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null); // Renamed from selectedUser
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    // Renamed from userFormData
    firstName: "",
    lastName: "",
    email: "",
    role: "student", // Hardcoded role
    departmentId: "",
    batchId: "",
    // Removed assignedModuleIds
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Removed modules fetch
        const [usersRes, departmentsRes, batchesRes] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/departments"),
          apiClient.get("/batches"),
          // apiClient.get("/modules"), // Removed
        ]);

        setAllUsers(usersRes.data);
        // Filter for students immediately after fetching
        setStudents(
          usersRes.data.filter((u) => u.role === ROLE_MAPPING.student)
        );
        setDepartments(departmentsRes.data);
        setBatches(batchesRes.data);
        // setModules(modulesRes.data); // Removed
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

  // Update students state if allUsers changes (e.g., after add/delete)
  useEffect(() => {
    setStudents(allUsers.filter((u) => u.role === ROLE_MAPPING.student));
  }, [allUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Removed handleModuleSelection

  const handleAddStudent = async (e) => {
    // Renamed from handleAddUser
    e.preventDefault();
    try {
      const newStudent = {
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        role: ROLE_MAPPING.student, // Always student
        departmentId: studentFormData.departmentId,
        enrolledBatchId: studentFormData.batchId, // Use enrolledBatchId based on original logic
      };

      const response = await apiClient.post("/users", newStudent);

      // Construct local student object
      const createdStudent = {
        ...response.data, // Assume API returns the created user/student object
        role: ROLE_MAPPING.student, // Ensure role is correct
        department: departments.find(
          (d) => d.id === parseInt(studentFormData.departmentId)
        ),
        enrolledBatch: batches.find(
          (b) => b.id === parseInt(studentFormData.batchId)
        ),
      };

      setAllUsers([...allUsers, createdStudent]); // Update the source list
      resetForm();
      toast.success(
        `Student ${newStudent.firstName} ${newStudent.lastName} created`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add student";
      toast.error(errorMessage);
    }
  };

  const handleUpdateStudent = async (e) => {
    // Renamed from handleUpdateUser
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const updatedStudentPayload = {
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        role: ROLE_MAPPING.student, // Always student
        departmentId: studentFormData.departmentId,
        batchId: studentFormData.batchId, // Use batchId based on original logic for update
      };

      // Include password only if provided
      if (studentFormData.password) {
        updatedStudentPayload.password = studentFormData.password;
      }

      const response = await apiClient.patch(
        `/users/${selectedStudent.id}`,
        updatedStudentPayload
      );

      // Construct updated local student object
      const updatedStudentData = {
        ...selectedStudent,
        ...response.data, // Prefer data from response if available
        // Manually update fields from form as fallback or if response is minimal
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        role: ROLE_MAPPING.student,
        departmentId: parseInt(studentFormData.departmentId),
        enrolledBatchId: parseInt(studentFormData.batchId), // Assuming API uses enrolledBatchId internally
        // --- Map relational data for display ---
        department: departments.find(
          (d) => d.id === parseInt(studentFormData.departmentId)
        ),
        enrolledBatch: batches.find(
          (b) => b.id === parseInt(studentFormData.batchId)
        ),
        assignedModules: null, // Ensure non-student fields are cleared
      };

      setAllUsers(
        // Update the source list
        allUsers.map((u) =>
          u.id === selectedStudent.id ? updatedStudentData : u
        )
      );
      resetForm();
      setSelectedStudent(null); // Clear selection
      toast.success(
        `Student ${updatedStudentData.firstName} ${updatedStudentData.lastName} updated`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update student";
      toast.error(errorMessage);
    }
  };

  const handleDeleteStudent = async (id) => {
    // Renamed from handleDeleteUser
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await apiClient.delete(`/users/${id}`);
      setAllUsers(allUsers.filter((u) => u.id !== id)); // Update the source list
      if (selectedStudent?.id === id) setSelectedStudent(null); // Clear selection if deleted
      toast.success("Student deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete student";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setStudentFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "student", // Default to student
      departmentId: "",
      batchId: "",
      password: "", // Also reset password field if used
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  const getFullName = (student) => `${student.firstName} ${student.lastName}`;

  // Filter the derived 'students' state based on search term
  const filteredStudents = students.filter((s) => {
    const fullName = getFullName(s).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    // No role filter needed here as 'students' only contains students
    return matchesSearch;
  });

  // Keep Admin check for accessing the page
  if (user?.role !== ROLE_MAPPING.coordinator) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading students...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          {/* Changed Title */}
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Display Section - List/Cards */}
        {!selectedStudent && !showForm && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search students..." // Changed placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <div className="flex gap-4">
                {/* Removed Role Filter Dropdown */}
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add New Student {/* Changed Button Text */}
                </button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-500">
                No students found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedStudent(s)} // Use setSelectedStudent
                    >
                      {getFullName(s)}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Email:</span> {s.email}
                    </p>
                    {/* Removed Role display */}
                    <p className="text-gray-700">
                      <span className="font-semibold">Department:</span>{" "}
                      {s.department?.name || "N/A"}
                    </p>
                    {s.enrolledBatch && ( // Check if batch exists
                      <p className="text-gray-700">
                        <span className="font-semibold">Batch:</span>{" "}
                        {s.enrolledBatch.name}
                      </p>
                    )}
                    {/* Removed Lecturer Module display */}
                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedStudent(s)} // Use setSelectedStudent
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage Student {/* Changed Button Text */}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Student Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Student" : "Add New Student"}{" "}
              {/* Changed Title */}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateStudent : handleAddStudent} // Use student handlers
              className="space-y-4"
            >
              {/* Basic Info Fields (First Name, Last Name, Email) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={studentFormData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={studentFormData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={studentFormData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>

              {/* Password field - only for Edit mode, and optional */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={studentFormData.password || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to keep current password
                  </p>
                </div>
              )}

              {/* Removed Role Selection Field */}

              {/* Department Selection Field - Always shown for students */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="departmentId"
                  value={studentFormData.departmentId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">Select a Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Selection Field - Always shown for students */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  name="batchId"
                  value={studentFormData.batchId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Removed Lecturer Module Selection */}
              {/* Removed Admin/Coordinator specific fields */}

              {/* Form Actions */}
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
                  {isEditMode ? "Update Student" : "Add Student"}{" "}
                  {/* Changed Button Text */}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Detail View */}
        {selectedStudent && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {getFullName(selectedStudent)}
              </h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedStudent.email}
              </p>
              {/* Removed Role display */}
              <p>
                <span className="font-semibold">Department: </span>
                {selectedStudent.department?.name ||
                  departments.find((d) => d.id === selectedStudent.departmentId)
                    ?.name ||
                  "N/A"}
              </p>
              {selectedStudent.enrolledBatch && (
                <p>
                  <span className="font-semibold">Batch:</span>{" "}
                  {selectedStudent.enrolledBatch.name ||
                    batches.find(
                      (b) => b.id === selectedStudent.enrolledBatchId
                    )?.name ||
                    "N/A"}
                </p>
              )}
              {/* Removed Assigned Modules display */}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Students
              </button>
              <button
                onClick={() => {
                  setStudentFormData({
                    firstName: selectedStudent.firstName,
                    lastName: selectedStudent.lastName,
                    email: selectedStudent.email,
                    role: "student", // Hardcoded
                    password: "",
                    departmentId: selectedStudent.departmentId || "",
                    batchId:
                      selectedStudent.enrolledBatch?.id ||
                      selectedStudent.enrolledBatchId ||
                      "", // Use enrolledBatchId if batch object isn't populated
                    // No assignedModuleIds
                  });
                  setIsEditMode(true);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Student {/* Changed Button Text */}
              </button>
              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)} // Use student handler
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Student {/* Changed Button Text */}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export with the original name if needed by routing, or use the new name
export default StudentManagement; // Or export default UserManagement;
