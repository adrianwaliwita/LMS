import React, { useState, useEffect } from "react";
import axios from "axios";

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);

  const [batchFormData, setBatchFormData] = useState({
    name: "",
    startDate: "",
    description: "",
  });

  const [newStudentData, setNewStudentData] = useState({
    name: "",
    email: "",
    departmentId: "",
    batchId: "",
    existingStudentId: "",
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch batches, students and departments on component mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/batches`),
      axios.get(`${baseUrl}/users?role=student`),
      axios.get(`${baseUrl}/departments`),
    ])
      .then(([batchesResponse, studentsResponse, departmentsResponse]) => {
        setBatches(batchesResponse.data);
        setStudents(studentsResponse.data);
        setDepartments(departmentsResponse.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setShowForm(false);
    setShowAddStudentForm(false);
  };

  // Handle batch form changes
  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setBatchFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle student form changes
  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setNewStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create new batch
  const handleCreateBatch = (e) => {
    e.preventDefault();

    axios
      .post(`${baseUrl}/batches`, batchFormData)
      .then((response) => {
        setBatches([...batches, response.data]);
        resetBatchForm();
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error creating batch:", error);
      });
  };

  // Edit batch setup
  const handleEditBatchSetup = (batch) => {
    setBatchFormData({
      name: batch.name,
      startDate: batch.startDate,
      description: batch.description || "",
    });
    setSelectedBatch(batch);
    setIsEditMode(true);
    setShowForm(true);
    setShowAddStudentForm(false);
  };

  // Update batch
  const handleUpdateBatch = (e) => {
    e.preventDefault();

    axios
      .put(`${baseUrl}/batches/${selectedBatch.id}`, batchFormData)
      .then((response) => {
        const updatedBatches = batches.map((batch) =>
          batch.id === selectedBatch.id ? { ...batch, ...batchFormData } : batch
        );
        setBatches(updatedBatches);
        resetBatchForm();
        setShowForm(false);
        setIsEditMode(false);
      })
      .catch((error) => {
        console.error("Error updating batch:", error);
      });
  };

  // Delete batch
  const handleDeleteBatch = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this batch? This action cannot be undone."
    );

    if (confirmed) {
      axios
        .delete(`${baseUrl}/batches/${id}`)
        .then(() => {
          setBatches(batches.filter((batch) => batch.id !== id));
          if (selectedBatch && selectedBatch.id === id) {
            setSelectedBatch(null);
          }
        })
        .catch((error) => {
          console.error("Error deleting batch:", error);
        });
    }
  };

  // Open add student form
  const handleOpenAddStudentForm = () => {
    if (!selectedBatch) return;

    // Filter students who are not assigned to any batch or have a different batch assignment
    const studentsWithoutBatch = students.filter(
      (student) => !student.batchId || student.batchId !== selectedBatch.id
    );

    setAvailableStudents(studentsWithoutBatch);
    setNewStudentData({
      name: "",
      email: "",
      departmentId: "",
      batchId: selectedBatch.id,
      existingStudentId: "",
    });
    setShowAddStudentForm(true);
    setShowForm(false);
  };

  // Add student to batch
  const handleAddStudentToBatch = (e) => {
    e.preventDefault();

    // For existing student selected from dropdown
    if (newStudentData.existingStudentId) {
      const studentToUpdate = students.find(
        (student) => student.id === newStudentData.existingStudentId
      );

      if (studentToUpdate) {
        const updatedStudent = {
          ...studentToUpdate,
          batchId: selectedBatch.id,
        };

        axios
          .put(`${baseUrl}/users/${studentToUpdate.id}`, updatedStudent)
          .then((response) => {
            const updatedStudents = students.map((student) =>
              student.id === studentToUpdate.id ? updatedStudent : student
            );
            setStudents(updatedStudents);
            resetStudentForm();
          })
          .catch((error) => {
            console.error("Error updating student:", error);
          });
      }
    }
    // For creating new student
    else {
      const newStudent = {
        ...newStudentData,
        batchId: selectedBatch.id,
        role: "student", // Explicitly set role to student
      };

      axios
        .post(`${baseUrl}/users`, newStudent)
        .then((response) => {
          setStudents([...students, response.data]);
          resetStudentForm();
        })
        .catch((error) => {
          console.error("Error creating student:", error);
        });
    }
  };

  // Remove student from batch
  const handleRemoveStudentFromBatch = (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student from the batch?"
    );

    if (confirmed) {
      const studentToUpdate = students.find(
        (student) => student.id === studentId
      );

      if (studentToUpdate) {
        const updatedStudent = {
          ...studentToUpdate,
          batchId: null,
        };

        axios
          .put(`${baseUrl}/users/${studentId}`, updatedStudent)
          .then((response) => {
            const updatedStudents = students.map((student) =>
              student.id === studentId ? updatedStudent : student
            );
            setStudents(updatedStudents);
          })
          .catch((error) => {
            console.error("Error updating student:", error);
          });
      }
    }
  };

  // Reset forms
  const resetBatchForm = () => {
    setBatchFormData({
      name: "",
      startDate: "",
      description: "",
    });
  };

  const resetStudentForm = () => {
    setNewStudentData({
      name: "",
      email: "",
      departmentId: "",
      batchId: "",
      existingStudentId: "",
    });
    setShowAddStudentForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditMode(false);
    resetBatchForm();
  };

  const handleCancelAddStudent = () => {
    resetStudentForm();
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (dept) => dept.departmentId === departmentId
    );
    return department ? department.departmentName : "Unknown";
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.description &&
        batch.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get students for a specific batch
  const getStudentsForBatch = (batchId) => {
    return students.filter((student) => student.batchId === batchId);
  };

  if (loading) return <p className="text-center p-4">Loading data...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Batch Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col flex-grow p-4">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search batches..."
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Action Button */}
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

        {/* Add/Edit Batch Form */}
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
                  placeholder="e.g., Batch E"
                  required
                />
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
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={batchFormData.description}
                  onChange={handleBatchFormChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  rows="3"
                  placeholder="Brief description of the batch"
                ></textarea>
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

        {/* Add Student Form */}
        {showAddStudentForm && selectedBatch && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Add Student to {selectedBatch.name}
            </h3>

            <form onSubmit={handleAddStudentToBatch} className="space-y-4">
              {availableStudents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Existing Student (optional)
                  </label>
                  <select
                    name="existingStudentId"
                    value={newStudentData.existingStudentId || ""}
                    onChange={handleStudentFormChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    <option value="">-- Create New Student --</option>
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Only show new student fields if no existing student is selected */}
              {!newStudentData.existingStudentId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newStudentData.name}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      placeholder="Student's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newStudentData.email}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      placeholder="Student's email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="departmentId"
                      value={newStudentData.departmentId}
                      onChange={handleStudentFormChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.departmentId}
                          value={dept.departmentId}
                        >
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  onClick={handleCancelAddStudent}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  {newStudentData.existingStudentId
                    ? "Add Student"
                    : "Create & Add Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conditional Rendering: Batch List / Batch Detail */}
        {!selectedBatch && !showForm ? (
          // Batches Grid
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  No batches found matching your search.
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const batchStudents = getStudentsForBatch(batch.id);
                return (
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
                    </div>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Start Date:</span>{" "}
                      {batch.startDate}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Students:</span>{" "}
                      {batchStudents.length}
                    </p>
                    {batch.description && (
                      <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                        {batch.description}
                      </p>
                    )}
                    <div className="mt-3">
                      <button
                        onClick={() => handleBatchClick(batch)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage Batch
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : selectedBatch && !showForm && !showAddStudentForm ? (
          // Batch Detail View
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedBatch.name}
              </h2>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p>
                <span className="font-semibold">Start Date:</span>{" "}
                {selectedBatch.startDate}
              </p>
              {selectedBatch.endDate && (
                <p>
                  <span className="font-semibold">End Date:</span>{" "}
                  {selectedBatch.endDate}
                </p>
              )}
              {selectedBatch.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-gray-700">{selectedBatch.description}</p>
                </div>
              )}

              {/* Students List */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Students</h3>
                  <button
                    onClick={handleOpenAddStudentForm}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Add Students
                  </button>
                </div>

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
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getStudentsForBatch(selectedBatch.id).length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-3 text-center text-gray-500"
                          >
                            No students assigned to this batch.
                          </td>
                        </tr>
                      ) : (
                        getStudentsForBatch(selectedBatch.id).map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {student.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {getDepartmentName(student.departmentId)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                              <button
                                onClick={() =>
                                  handleRemoveStudentFromBatch(student.id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
