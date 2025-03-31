import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import {
  FiDownload,
  FiCheckCircle,
  FiUpload,
  FiFileText,
} from "react-icons/fi";

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [viewMode, setViewMode] = useState("assignments");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (!user?.enrolledBatch?.id) {
          setLoading(false);
          return;
        }

        const response = await apiClient.get("/assignments", {
          params: { batchId: user.enrolledBatch.id },
        });
        setAssignments(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(
          error.response?.data?.message || "Failed to fetch assignments"
        );
        toast.error(
          error.response?.data?.message || "Failed to fetch assignments"
        );
      }
    };

    fetchAssignments();
  }, [user]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedAssignment) {
        try {
          const response = await apiClient.get(
            `/assignments/${selectedAssignment.id}/submissions`
          );
          setSubmissions(response.data);
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to fetch submissions"
          );
        }
      }
    };

    fetchSubmissions();
  }, [selectedAssignment]);

  const filteredAssignments = assignments.filter((assignment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.title.toLowerCase().includes(searchLower) ||
      (assignment.module?.title &&
        assignment.module.title.toLowerCase().includes(searchLower))
    );
  });

  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  const handleTextChange = (e) => {
    setSubmissionText(e.target.value);
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile && !submissionText.trim()) {
      toast.error("Please provide either a file or text submission");
      return;
    }

    try {
      const formData = new FormData();
      if (submissionFile) formData.append("file", submissionFile);
      if (submissionText.trim()) formData.append("text", submissionText);

      const response = await apiClient.post(
        `/assignments/${selectedAssignment.id}/make-submission`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Assignment submitted successfully!");
      setSubmissionFile(null);
      setSubmissionText("");
      setSubmissions([...submissions, response.data]);
      setViewMode("submissions"); // Automatically switch to submissions view
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit assignment"
      );
    }
  };

  const downloadBrief = async (assignmentId) => {
    try {
      const response = await apiClient.get(
        `/assignments/${assignmentId}/download-brief`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assignment-brief-${assignmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download brief");
    }
  };

  const downloadSubmission = async (submissionId) => {
    try {
      const response = await apiClient.get(
        `/assignments/${selectedAssignment.id}/submissions/${submissionId}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submission-${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to download submission"
      );
    }
  };

  const hasSubmitted = (assignmentId) => {
    return submissions.some((sub) => sub.assignmentId === assignmentId);
  };

  if (loading)
    return <div className="text-center p-8">Loading assignments...</div>;

  return (
    <div className="min-h-screen ">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Assignments</h1>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setViewMode("assignments");
              setSelectedAssignment(null);
            }}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === "assignments"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            My Assignments
          </button>
          {selectedAssignment && (
            <button
              onClick={() => setViewMode("submissions")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "submissions"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              My Submissions
            </button>
          )}
        </div>
        {viewMode === "assignments" && !selectedAssignment && (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No assignments found.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`border-2 bg-white p-4 rounded-lg shadow hover:shadow-md transition ${
                      hasSubmitted(assignment.id)
                        ? "border-green-500"
                        : new Date(assignment.dueDate) < new Date()
                        ? "border-gray-300"
                        : "border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-lg font-semibold cursor-pointer"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        {assignment.title}
                      </h3>
                      {hasSubmitted(assignment.id) && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <FiCheckCircle className="mr-1" /> Submitted
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Module:</span>{" "}
                      {assignment.module?.title || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Due:</span>{" "}
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex justify-between">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center"
                      >
                        <FiFileText className="mr-1" /> Details
                      </button>
                      {assignment.briefUrl && (
                        <button
                          onClick={() => console.info(assignment.id)}
                          className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center"
                        >
                          <FiDownload className="mr-1" /> Brief
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {selectedAssignment && viewMode === "assignments" && (
          <div className="bg-white border-2 border-blue-500 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedAssignment.title}
                </h2>
                <div className="flex items-center mt-1">
                  <span className="text-gray-600 mr-2">
                    Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                  </span>
                  {hasSubmitted(selectedAssignment.id) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <FiCheckCircle className="mr-1" /> Submitted
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-gray-700 whitespace-pre-line mt-2">
                  {selectedAssignment.description || "No description provided."}
                </p>
              </div>

              {selectedAssignment.module && (
                <div>
                  <h3 className="font-semibold">Module</h3>
                  <p className="text-gray-700">
                    {selectedAssignment.module.title}
                  </p>
                </div>
              )}
            </div>

            {!hasSubmitted(selectedAssignment.id) ? (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Submit Your Work</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File (DOC/DOCx files only. Max size: 5MB):
                    </label>
                    <div className="flex items-center">
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition flex items-center">
                        <FiUpload className="mr-2" />
                        Choose File
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {submissionFile && (
                        <span className="ml-3 text-gray-700">
                          {submissionFile.name}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => downloadBrief(selectedAssignment.id)}
                          className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg border border-gray-300 transition flex items-center"
                        >
                          <FiDownload className="mr-2" />
                          Download Brief
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or write your submission here:
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={handleTextChange}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="Enter your assignment submission..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                    >
                      Back to Assignments
                    </button>
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={!submissionFile && !submissionText.trim()}
                      className={`px-4 py-2 rounded transition flex items-center ${
                        !submissionFile && !submissionText.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <FiCheckCircle className="mr-2" /> Submit Assignment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={() => setViewMode("submissions")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  View My Submissions
                </button>
              </div>
            )}
          </div>
        )}
        {selectedAssignment && viewMode === "submissions" && (
          <div className="bg-white border-2 border-blue-500 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  My Submissions for {selectedAssignment.title}
                </h2>
                <p className="text-gray-600">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewMode("assignments")}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No submissions found for this assignment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`border p-4 rounded-lg ${
                      submission.grade
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <FiCheckCircle className="text-green-500 mr-2 text-xl" />
                        <span className="text-gray-700 font-medium">
                          Submitted
                        </span>
                      </div>
                      {submission.fileUrl && (
                        <button
                          onClick={() => downloadSubmission(submission.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center"
                        >
                          <FiDownload className="mr-1" /> Download
                        </button>
                      )}
                    </div>
                    {submission.text && (
                      <p className="text-gray-700 mt-2 ml-8 whitespace-pre-line">
                        {submission.text}
                      </p>
                    )}
                    {submission.grade && (
                      <div className="mt-3 p-3 bg-white rounded border border-green-200">
                        <h4 className="font-medium text-green-700">
                          Feedback:
                        </h4>
                        <p className="text-gray-700 font-semibold">
                          Grade: {submission.grade}/100
                        </p>
                        {submission.feedback && (
                          <p className="text-gray-700 mt-1 whitespace-pre-line">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewMode("assignments")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Back to Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
