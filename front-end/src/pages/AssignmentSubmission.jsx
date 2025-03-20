import React, { useState } from "react";

const AssignmentSubmission = () => {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      course: "Software Engineering",
      title: "Design Pattern Analysis",
      dueDate: "2024-03-15",
      status: "Pending",
      submitted: false,
    },
    {
      id: 2,
      course: "Data Structures",
      title: "Linked List Implementation",
      dueDate: "2024-03-20",
      status: "Not Started",
      submitted: false,
    },
    {
      id: 3,
      course: "Network Security",
      title: "Cryptography Project",
      dueDate: "2024-03-25",
      status: "In Progress",
      submitted: false,
    },
  ]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please select a file to submit");
      return;
    }

    // Update assignment status to Submitted
    const updatedAssignments = assignments.map((assignment) =>
      assignment.id === selectedAssignment.id
        ? { ...assignment, status: "Submitted", submitted: true }
        : assignment
    );

    setAssignments(updatedAssignments);
    setSelectedFile(null);
    // Update the selected assignment view as well
    setSelectedAssignment({
      ...selectedAssignment,
      status: "Submitted",
      submitted: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "In Progress":
        return "text-blue-600";
      case "Not Started":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar - hidden on mobile, visible on md breakpoint and up */}

      {/* Assignments content - full width on mobile, adjusted on larger screens */}
      <div className="w-full md:w-3/4 lg:w-4/5 px-4 md:px-6 py-6 md:py-10">
        {!selectedAssignment ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-blue-700">My Assignments</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border-2 border-blue-700 p-4 rounded-lg shadow bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAssignmentClick(assignment)}
                >
                  <h3 className="text-lg font-semibold text-blue-700">
                    {assignment.title}
                  </h3>
                  <p className="text-gray-700 mt-2">{assignment.course}</p>
                  <p
                    className={`${getStatusColor(
                      assignment.status
                    )} font-medium mt-1`}
                  >
                    {assignment.status}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <span className="font-semibold">Due:</span>{" "}
                    {assignment.dueDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow w-full max-w-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              {selectedAssignment.title}
            </h2>

            <div className="space-y-3">
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Course:</span>{" "}
                {selectedAssignment.course}
              </p>
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Due Date:</span>{" "}
                {selectedAssignment.dueDate}
              </p>
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Status:</span>{" "}
                <span className={getStatusColor(selectedAssignment.status)}>
                  {selectedAssignment.status}
                </span>
              </p>
            </div>

            {!selectedAssignment.submitted ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors cursor-pointer">
                    Select File
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-gray-600">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  disabled={!selectedFile}
                >
                  Submit Assignment
                </button>
              </div>
            ) : (
              <div className="mt-6 flex items-center text-green-600 font-semibold">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Assignment Submitted
              </div>
            )}

            <button
              className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              onClick={() => setSelectedAssignment(null)}
            >
              Back to Assignment List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmission;
