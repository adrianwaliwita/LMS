import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

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
  const { user, token } = useAuth();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    departmentId: "",
    batchId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes, batchesRes] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/departments"),
          apiClient.get("/batches"),
        ]);

        // Filter only students
        const studentUsers = usersRes.data.filter(
          (user) => user.role === ROLE_MAPPING.student
        );
        setStudents(studentUsers);
        setDepartments(departmentsRes.data);
        setBatches(batchesRes.data);
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
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const newStudent = {
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        role: ROLE_MAPPING.student,
        password: studentFormData.password,
        departmentId: studentFormData.departmentId,
        enrolledBatchId: studentFormData.batchId,
      };

      const response = await apiClient.post("/users", newStudent);

      // Attach full department and batch objects
      const createdStudent = {
        ...response.data,
        department: departments.find(
          (d) => d.id === parseInt(studentFormData.departmentId)
        ),
        enrolledBatch: batches.find(
          (b) => b.id === parseInt(studentFormData.batchId)
        ),
      };

      setStudents([...students, createdStudent]);
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
    e.preventDefault();
    try {
      const updatedStudent = {
        firstName: studentFormData.firstName,
        lastName: studentFormData.lastName,
        email: studentFormData.email,
        departmentId: studentFormData.departmentId,
        batchId: studentFormData.batchId,
      };

      if (studentFormData.password)
        updatedStudent.password = studentFormData.password;

      const response = await apiClient.patch(
        `/users/${selectedStudent.id}`,
        updatedStudent
      );

      const updatedStudentData = {
        ...selectedStudent,
        ...updatedStudent,
        department: departments.find(
          (d) => d.id === parseInt(studentFormData.departmentId)
        ),
        enrolledBatch: batches.find(
          (b) => b.id === parseInt(studentFormData.batchId)
        ),
      };

      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id ? updatedStudentData : s
        )
      );
      resetForm();
      setSelectedStudent(null);
      toast.success(
        `Student ${updatedStudent.firstName} ${updatedStudent.lastName} updated`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update student";
      toast.error(errorMessage);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await apiClient.delete(`/users/${id}`);
      setStudents(students.filter((s) => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
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
      password: "",
      departmentId: "",
      batchId: "",
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  const getFullName = (student) => `${student.firstName} ${student.lastName}`;

  const filteredStudents = students.filter((s) => {
    const fullName = getFullName(s).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // if (user?.role !== ROLE_MAPPING.coordinator) {
  //   return (
  //     <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
  //       <p className="text-red-700">
  //         You don't have permission to access this page.
  //       </p>
  //     </div>
  //   );
  // }

  if (loading) return <p className="text-center p-4">Loading students...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!selectedStudent && !showForm && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setIsEditMode(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add New Student
              </button>
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
                      onClick={() => setSelectedStudent(s)}
                    >
                      {getFullName(s)}
                    </h3>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Email:</span> {s.email}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Department:</span>{" "}
                      {s.department?.name || "Unknown"}
                    </p>
                    {s.enrolledBatch && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Batch:</span>{" "}
                        {s.enrolledBatch.name}
                      </p>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage Student
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
              {isEditMode ? "Edit Student" : "Add New Student"}
            </h3>
            <form
              onSubmit={isEditMode ? handleUpdateStudent : handleAddStudent}
              className="space-y-4"
            >
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={studentFormData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  minLength={isEditMode ? 0 : 6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder={
                    isEditMode
                      ? "Leave blank to keep current"
                      : "Enter password"
                  }
                />
                {!isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="departmentId"
                  value={studentFormData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  {isEditMode ? "Update Student" : "Add Student"}
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
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedStudent.email}
              </p>
              <p>
                <span className="font-semibold">Department: </span>
                {selectedStudent.department?.name ||
                  departments.find((d) => d.id === selectedStudent.departmentId)
                    ?.name ||
                  "Unknown"}
              </p>
              {selectedStudent.enrolledBatch && (
                <p>
                  <span className="font-semibold">Batch:</span>{" "}
                  {selectedStudent.enrolledBatch.name || "Unknown"}
                </p>
              )}
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
                    password: "",
                    departmentId: selectedStudent.departmentId || "",
                    batchId: selectedStudent.enrolledBatch?.id || "",
                  });
                  setIsEditMode(true);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Student
              </button>
              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Student
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
