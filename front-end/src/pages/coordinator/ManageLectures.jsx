import React, { useState } from "react";

const CourseManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // New state for course/batch creation
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    name: "",
    time: "",
    instructor: "",
    location: "",
    description: "",
  });
  const [newBatchData, setNewBatchData] = useState({
    name: "",
    startDate: "",
  });

  // Mock data
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Math 101",
      time: "Monday 9:00 AM - 11:00 AM",
      instructor: "Dr. Smith",
      location: "Room A1",
      description: "Introduction to Mathematics",
      enrolledUsers: 24,
      assignedBatches: ["Batch A", "Batch C"],
    },
    {
      id: 2,
      name: "Physics 202",
      time: "Wednesday 2:00 PM - 4:00 PM",
      instructor: "Prof. Johnson",
      location: "Lab B2",
      description: "Fundamentals of Physics",
      enrolledUsers: 18,
      assignedBatches: ["Batch B"],
    },
    {
      id: 3,
      name: "CS 305",
      time: "Friday 11:00 AM - 1:00 PM",
      instructor: "Dr. Lee",
      location: "Room C3",
      description: "Data Structures and Algorithms",
      enrolledUsers: 30,
      assignedBatches: ["Batch A", "Batch D"],
    },
  ]);

  const [batches, setBatches] = useState([
    { id: 1, name: "Batch A", userCount: 45, startDate: "Jan 10, 2025" },
    { id: 2, name: "Batch B", userCount: 38, startDate: "Feb 15, 2025" },
    { id: 3, name: "Batch C", userCount: 42, startDate: "Mar 5, 2025" },
    { id: 4, name: "Batch D", userCount: 36, startDate: "Apr 1, 2025" },
  ]);

  const users = [
    {
      id: 1,
      name: "Jane Cooper",
      email: "jane@example.com",
      batch: "Batch A",
      courses: 2,
    },
    {
      id: 2,
      name: "Alex Johnson",
      email: "alex@example.com",
      batch: "Batch B",
      courses: 1,
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria@example.com",
      batch: "Batch A",
      courses: 3,
    },
    {
      id: 4,
      name: "Tom Wilson",
      email: "tom@example.com",
      batch: "Batch C",
      courses: 2,
    },
    {
      id: 5,
      name: "Sarah Lee",
      email: "sarah@example.com",
      batch: "Batch D",
      courses: 1,
    },
  ];

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleAssignCourse = (type) => {
    setAssignmentType(type);
    setShowAssignModal(true);
  };

  const confirmAssignment = () => {
    // In a real application, this would make an API call
    alert(
      `Course ${selectedCourse.name} assigned to ${
        assignmentType === "batch"
          ? selectedBatch.name
          : selectedUsers.length + " users"
      }`
    );
    setShowAssignModal(false);
    setSelectedBatch(null);
    setSelectedUsers([]);
  };

  // Handle new course form changes
  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new batch form changes
  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    setNewBatchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create new course
  const handleCreateCourse = () => {
    const newCourse = {
      id: courses.length + 1,
      ...newCourseData,
      enrolledUsers: 0,
      assignedBatches: [],
    };

    setCourses((prev) => [...prev, newCourse]);
    setNewCourseData({
      name: "",
      time: "",
      instructor: "",
      location: "",
      description: "",
    });
    setShowNewCourseModal(false);
  };

  // Create new batch
  const handleCreateBatch = () => {
    const newBatch = {
      id: batches.length + 1,
      ...newBatchData,
      userCount: 0,
    };

    setBatches((prev) => [...prev, newBatch]);
    setNewBatchData({
      name: "",
      startDate: "",
    });
    setShowNewBatchModal(false);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Course Management System</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col flex-grow p-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "courses"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "batches"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("batches")}
          >
            Batches
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "Students"
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Action Buttons */}
          {activeTab === "courses" && !selectedCourse && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowNewCourseModal(true)}
            >
              Create New Course
            </button>
          )}

          {activeTab === "batches" && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowNewBatchModal(true)}
            >
              Create New Batch
            </button>
          )}

          {activeTab === "users" && selectedUsers.length > 0 && (
            <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
              Assign Course to Selected ({selectedUsers.length})
            </button>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === "courses" && !selectedCourse && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="border bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCourseClick(course)}
              >
                <h3 className="text-lg font-semibold text-blue-700">
                  {course.name}
                </h3>
                <p className="text-gray-700 mt-2">{course.time}</p>
                <p className="text-gray-700">
                  <span className="font-semibold">Instructor:</span>{" "}
                  {course.instructor}
                </p>
                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span>{course.enrolledUsers} users</span>
                  <span>{course.assignedBatches.length} batches</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "courses" && selectedCourse && (
          <div className="bg-white border p-6 rounded-lg shadow w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedCourse.name}
              </h2>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  onClick={() => handleAssignCourse("batch")}
                >
                  Assign to Batch
                </button>
                <button
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  onClick={() => handleAssignCourse("user")}
                >
                  Assign to Users
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="pb-2 border-b border-gray-200">
                  <span className="font-semibold">Instructor:</span>{" "}
                  {selectedCourse.instructor}
                </p>
                <p className="pb-2 border-b border-gray-200">
                  <span className="font-semibold">Schedule:</span>{" "}
                  {selectedCourse.time}
                </p>
                <p className="pb-2 border-b border-gray-200">
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedCourse.location}
                </p>
                <p className="pb-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {selectedCourse.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assigned Batches:</h3>
                <ul className="bg-gray-50 p-3 rounded border">
                  {selectedCourse.assignedBatches.length > 0 ? (
                    selectedCourse.assignedBatches.map((batch, index) => (
                      <li
                        key={index}
                        className="py-1 border-b last:border-b-0 border-gray-200"
                      >
                        {batch}
                      </li>
                    ))
                  ) : (
                    <li className="py-1 text-gray-500">No batches assigned</li>
                  )}
                </ul>
              </div>
            </div>

            <button
              className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              onClick={() => setSelectedCourse(null)}
            >
              Back to Course List
            </button>
          </div>
        )}

        {activeTab === "batches" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="border bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBatchClick(batch)}
              >
                <h3 className="text-lg font-semibold text-blue-700">
                  {batch.name}
                </h3>
                <p className="text-gray-700 mt-2">
                  <span className="font-semibold">Users:</span>{" "}
                  {batch.userCount}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Start Date:</span>{" "}
                  {batch.startDate}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={() => {
                        if (selectedUsers.length === users.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(users.map((user) => user.id));
                        }
                      }}
                      checked={
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.batch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.courses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Assign {selectedCourse.name} to{" "}
              {assignmentType === "batch" ? "Batch" : "Users"}
            </h3>

            {assignmentType === "batch" ? (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Select Batch:
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={selectedBatch ? selectedBatch.id : ""}
                  onChange={(e) => {
                    const batchId = parseInt(e.target.value);
                    setSelectedBatch(batches.find((b) => b.id === batchId));
                  }}
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Selected Users: {selectedUsers.length}
                </p>
                {selectedUsers.length === 0 && (
                  <p className="text-red-500 text-sm">
                    Please select users from the Users tab first
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                onClick={confirmAssignment}
                disabled={
                  (assignmentType === "batch" && !selectedBatch) ||
                  (assignmentType === "user" && selectedUsers.length === 0)
                }
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Course</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCourseData.name}
                  onChange={handleCourseFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Biology 101"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Schedule</label>
                <input
                  type="text"
                  name="time"
                  value={newCourseData.time}
                  onChange={handleCourseFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Monday 9:00 AM - 11:00 AM"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={newCourseData.instructor}
                  onChange={handleCourseFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newCourseData.location}
                  onChange={handleCourseFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Room A1"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newCourseData.description}
                  onChange={handleCourseFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Brief description of the course"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowNewCourseModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleCreateCourse}
                disabled={!newCourseData.name || !newCourseData.instructor}
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Batch Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Batch</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  name="name"
                  value={newBatchData.name}
                  onChange={handleBatchFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Batch E"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  name="startDate"
                  value={newBatchData.startDate}
                  onChange={handleBatchFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., May 15, 2025"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowNewBatchModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleCreateBatch}
                disabled={!newBatchData.name || !newBatchData.startDate}
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
