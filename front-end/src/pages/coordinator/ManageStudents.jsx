import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const StudentManagement = () => {
  const { user } = useAuth();

  // Data States
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);

  // UI & Form States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    email: "",
    departmentId: "",
    batchId: "",
  });

  // Fetch students and related data on mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/users?role=student`),
      axios.get(`${baseUrl}/departments`),
      axios.get(`${baseUrl}/batches`),
    ])
      .then(([studentsRes, departmentsRes, batchesRes]) => {
        setStudents(studentsRes.data);
        setDepartments(departmentsRes.data);
        setBatches(batchesRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Helper functions
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "No Department";
    const department = departments.find(
      (dept) => dept.departmentId === departmentId
    );
    return department ? department.departmentName : "Unknown Department";
  };

  const getBatchName = (batchId) => {
    if (!batchId) return "No Batch";
    const batch = batches.find((b) => b.batchId === batchId);
    return batch ? batch.name : "Unknown Batch";
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Student operations
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const newStudent = {
        ...studentFormData,
        role: "student",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await axios.post(`${baseUrl}/users`, newStudent);
      setStudents([...students, res.data]);
      resetForm();
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const updatedStudent = {
        ...studentFormData,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(`${baseUrl}/users/${selectedStudent.id}`, updatedStudent);
      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id ? { ...s, ...updatedStudent } : s
        )
      );
      resetForm();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await axios.delete(`${baseUrl}/users/${id}`);
      setStudents(students.filter((s) => s.id !== id));
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const resetForm = () => {
    setStudentFormData({
      name: "",
      email: "",
      departmentId: "",
      batchId: "",
    });
    setIsEditMode(false);
    setShowForm(false);
    setSelectedStudent(null);
  };

  // Filter students based on search
  const filteredStudents = students.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(s.departmentId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getBatchName(s.batchId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <p className="text-center p-4">Loading students...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Student Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
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
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add New Student
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-500">No students found.</p>
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
                      {s.name}
                    </h3>
                    <p className="text-gray-700 mt-2">Email: {s.email}</p>
                    <p className="text-gray-700">
                      Department: {getDepartmentName(s.departmentId)}
                    </p>
                    <p className="text-gray-700">
                      Batch: {getBatchName(s.batchId)}
                    </p>
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
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentFormData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
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
                />
              </div>
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
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
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
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.batchId} value={batch.batchId}>
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

        {selectedStudent && !showForm && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedStudent.name}
              </h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>Email: {selectedStudent.email}</p>
              <p>
                Department: {getDepartmentName(selectedStudent.departmentId)}
              </p>
              <p>Batch: {getBatchName(selectedStudent.batchId)}</p>
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
                    name: selectedStudent.name,
                    email: selectedStudent.email,
                    departmentId: selectedStudent.departmentId,
                    batchId: selectedStudent.batchId,
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
