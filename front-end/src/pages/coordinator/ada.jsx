import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import {
  FiDownload,
  FiEye,
  FiArrowLeft,
  FiFileText,
  FiUpload,
  FiX,
} from "react-icons/fi";

const AssignmentIssuer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingBrief, setIsUploadingBrief] = useState(false);

  const [formData, setFormData] = useState({
    batchId: "",
    courseId: "",
    moduleId: "",
    title: "",
    description: "",
    dueDate: "",
  });

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await apiClient.get(`/users/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student details:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, coursesRes, assignmentsRes] = await Promise.all([
          apiClient.get("/batches"),
          apiClient.get("/courses?includeModules=true"),
          apiClient.get("/assignments?includeDetails=true"),
        ]);

        setBatches(batchesRes.data);
        setCourses(coursesRes.data);
        setAssignments(assignmentsRes.data);

        const allModules = coursesRes.data.flatMap(
          (course) =>
            course.modules?.map((module) => ({
              ...module,
              courseId: course.id,
              courseTitle: course.title,
            })) || []
        );

        setModules(allModules);
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

  useEffect(() => {
    if (formData.courseId) {
      const filtered = modules.filter(
        (module) => module.courseId === parseInt(formData.courseId)
      );
      setFilteredModules(filtered);
      setFormData((prev) => ({ ...prev, moduleId: "" }));
    } else {
      setFilteredModules([]);
    }
  }, [formData.courseId, modules]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedAssignment) {
        try {
          const response = await apiClient.get(
            `/assignments/${selectedAssignment.id}/submissions`
          );

          const submissionsWithStudents = await Promise.all(
            response.data.map(async (submission) => {
              if (submission.studentId) {
                const student = await fetchStudentDetails(submission.studentId);
                return { ...submission, student };
              }
              return submission;
            })
          );

          setSubmissions(submissionsWithStudents);
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to fetch submissions"
          );
        }
      }
    };

    fetchSubmissions();
  }, [selectedAssignment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is PDF or DOCX
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a PDF or DOCX file only");
        e.target.value = ""; // Clear the file input
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    document.getElementById("assignmentBriefFile").value = ""; // Clear the file input
  };

  const handleUploadBrief = async (assignmentId) => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploadingBrief(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiClient.post(
        `/assignments/${assignmentId}/upload-brief`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh assignments list
      const updatedAssignments = await apiClient.get(
        "/assignments?includeDetails=true"
      );
      setAssignments(updatedAssignments.data);

      toast.success("Brief uploaded successfully!");
      setSelectedFile(null);
      document.getElementById("file").value = ""; // Clear the file input
    } catch (error) {
      console.error("Error uploading brief:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to upload brief"
      );
    } finally {
      setIsUploadingBrief(false);
    }
  };

  const handleDownloadBrief = async (assignmentId) => {
    try {
      const response = await apiClient.get(
        `/assignments/${assignmentId}/download-brief`,
        { responseType: "blob" }
      );

      const contentDisposition = response.headers["content-disposition"];
      let filename = `assignment-brief-${assignmentId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const contentType = response.headers["content-type"];
      let extension = "";

      if (contentType.includes("pdf")) {
        extension = "pdf";
      } else if (
        contentType.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        extension = "docx";
      } else if (contentType.includes("msword")) {
        extension = "doc";
      }

      if (!extension) {
        const filenameExt = filename.split(".").pop().toLowerCase();
        if (["pdf", "docx", "doc"].includes(filenameExt)) {
          extension = filenameExt;
        }
      }

      if (!extension) {
        const blobStart = await response.data.slice(0, 4).text();

        if (blobStart.includes("%PDF")) {
          extension = "pdf";
        } else if (blobStart.startsWith("PK")) {
          extension = "docx";
        } else {
          extension = "pdf";
        }
      }

      filename = filename.replace(/\.[^/.]+$/, "");
      filename = `${filename}.${extension}`;

      const blob = new Blob([response.data], {
        type: contentType || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download brief");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the assignment
      const jsonPayload = {
        batchId: parseInt(formData.batchId, 10),
        moduleId: parseInt(formData.moduleId, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      const response = await apiClient.post("/assignments", jsonPayload, {
        headers: { "Content-Type": "application/json" },
      });

      // If there's a file to upload, upload it now
      if (selectedFile) {
        const formData = new FormData();
        formData.append("brief", selectedFile);

        await apiClient.post(
          `/assignments/${response.data.id}/upload-brief`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Refresh assignments list
      const updatedAssignments = await apiClient.get(
        "/assignments?includeDetails=true"
      );
      setAssignments(updatedAssignments.data);

      toast.success("Assignment created successfully!");
      setFormData({
        batchId: "",
        courseId: "",
        moduleId: "",
        title: "",
        description: "",
        dueDate: "",
      });
      setSelectedFile(null);
      document.getElementById("assignmentBriefFile").value = ""; // Clear the file input
      setActiveTab("view");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create assignment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadSubmission = async (submissionId) => {
    try {
      const response = await apiClient.get(
        `/assignments/${selectedAssignment.id}/submissions/${submissionId}/download`,
        { responseType: "blob" }
      );

      const contentDisposition = response.headers["content-disposition"];
      let filename = `submission-${submissionId}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const contentType = response.headers["content-type"];
      let extension = "";

      if (contentType.includes("pdf")) {
        extension = "pdf";
      } else if (
        contentType.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ) {
        extension = "docx";
      } else if (contentType.includes("msword")) {
        extension = "doc";
      }

      if (!extension) {
        const filenameExt = filename.split(".").pop().toLowerCase();
        if (["pdf", "docx", "doc"].includes(filenameExt)) {
          extension = filenameExt;
        }
      }

      if (!extension) {
        const blobStart = await response.data.slice(0, 4).text();

        if (blobStart.includes("%PDF")) {
          extension = "pdf";
        } else if (blobStart.startsWith("PK")) {
          extension = "docx";
        } else {
          extension = "pdf";
        }
      }

      filename = filename.replace(/\.[^/.]+$/, "");
      filename = `${filename}.${extension}`;

      const blob = new Blob([response.data], {
        type: contentType || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to download submission"
      );
    }
  };

  if (loading) return <p className="text-center p-4">Loading data...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="container mx-auto flex flex-col flex-grow p-4">
        <header className="bg-blue-700 text-white p-4 shadow rounded-xl mb-6">
          <h1 className="text-2xl font-bold">Assignment Management</h1>
        </header>

        {selectedAssignment ? (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FiArrowLeft className="mr-1" /> Back to Assignments
            </button>

            <h2 className="text-xl font-bold text-blue-700 mb-2">
              {selectedAssignment.title}
            </h2>
            <div className="mb-4 text-gray-600">
              <p>
                <span className="font-medium">Module:</span>{" "}
                {selectedAssignment.module?.title || "N/A"}
              </p>
              <p>
                <span className="font-medium">Batch:</span>{" "}
                {selectedAssignment.batch?.name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Due Date:</span>{" "}
                {formatDate(selectedAssignment.dueDate)}
              </p>
              {selectedAssignment.isBriefUploaded && (
                <p>
                  <span className="font-medium">Brief:</span>{" "}
                  <button
                    onClick={() => handleDownloadBrief(selectedAssignment.id)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiFileText className="mr-1" /> Download Brief
                  </button>
                </p>
              )}
            </div>

            {!selectedAssignment.isBriefUploaded && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">
                  Upload Assignment Brief
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center hover:bg-gray-50"
                    >
                      <FiUpload className="mr-2" />
                      {selectedFile
                        ? selectedFile.name
                        : "Select PDF or DOCX file"}
                    </label>
                  </div>
                  {selectedFile && (
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800"
                      title="Remove file"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => handleUploadBrief(selectedAssignment.id)}
                    disabled={!selectedFile || isUploadingBrief}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                  >
                    {isUploadingBrief ? "Uploading..." : "Upload Brief"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only PDF and DOCX files are accepted
                </p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Submissions ({submissions.length})
              </h3>
              {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {submission.student ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {submission.student.firstName}{" "}
                                  {submission.student.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {submission.student.email}
                                </p>
                                {submission.student.enrolledBatch && (
                                  <p className="text-xs text-gray-500">
                                    Batch:{" "}
                                    {submission.student.enrolledBatch.name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Unknown Student
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(submission.createdAt)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.fileUrl ? "File" : "Text"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            {submission.fileName && (
                              <button
                                onClick={() =>
                                  downloadSubmission(submission.id)
                                }
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Download Submission"
                              >
                                <FiDownload className="mr-1" /> Download
                              </button>
                            )}
                            {submission.text && (
                              <button
                                onClick={() => {
                                  toast.info(
                                    <div className="p-2">
                                      <h4 className="font-bold mb-2">
                                        Text Submission
                                      </h4>
                                      <div className="whitespace-pre-wrap bg-gray-100 p-3 rounded">
                                        {submission.text}
                                      </div>
                                      {submission.student && (
                                        <div className="mt-2 text-sm">
                                          <p>
                                            <span className="font-medium">
                                              Submitted by:
                                            </span>{" "}
                                            {submission.student.firstName}{" "}
                                            {submission.student.lastName}
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              Email:
                                            </span>{" "}
                                            {submission.student.email}
                                          </p>
                                          {submission.student.enrolledBatch && (
                                            <p>
                                              <span className="font-medium">
                                                Batch:
                                              </span>{" "}
                                              {
                                                submission.student.enrolledBatch
                                                  .name
                                              }
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>,
                                    {
                                      autoClose: false,
                                      closeButton: true,
                                    }
                                  );
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center ml-4"
                                title="View Text Submission"
                              >
                                <FiEye className="mr-1" /> View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-3 px-6 font-medium ${
                  activeTab === "create"
                    ? "text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("create")}
              >
                Create Assignment
              </button>
              <button
                className={`py-3 px-6 font-medium ${
                  activeTab === "view"
                    ? "text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("view")}
              >
                View Assignments ({assignments.length})
              </button>
            </div>

            {activeTab === "create" ? (
              <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Batch
                      </label>
                      <select
                        name="batchId"
                        value={formData.batchId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.id}>
                            {batch.name} (
                            {new Date(batch.startDate).toLocaleDateString()} -{" "}
                            {new Date(batch.endDate).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Course
                      </label>
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course.levelName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Module
                      </label>
                      <select
                        name="moduleId"
                        value={formData.moduleId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!formData.courseId}
                      >
                        <option value="">
                          {formData.courseId
                            ? "Select Module"
                            : "Select Course first"}
                        </option>
                        {filteredModules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Assignment Brief (Optional)
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="assignmentBriefFile"
                            onChange={handleFileChange}
                            accept=".pdf,.docx"
                            className="hidden"
                          />
                          <label
                            htmlFor="assignmentBriefFile"
                            className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center hover:bg-gray-50 w-full"
                          >
                            <FiUpload className="mr-2" />
                            {selectedFile
                              ? selectedFile.name
                              : "Select PDF or DOCX file"}
                          </label>
                        </div>
                        {selectedFile && (
                          <button
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-800"
                            title="Remove file"
                            type="button"
                          >
                            <FiX size={20} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Upload the assignment brief file (PDF or DOCX format)
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Assignment Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          batchId: "",
                          courseId: "",
                          moduleId: "",
                          title: "",
                          description: "",
                          dueDate: "",
                        });
                        setSelectedFile(null);
                        document.getElementById("assignmentBriefFile").value =
                          "";
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:bg-blue-400"
                    >
                      {isSubmitting ? "Creating..." : "Create Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-blue-700 mb-4">
                  Issued Assignments
                </h2>

                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No assignments have been created yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Module
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Batch
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brief
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.title}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.module?.title || "N/A"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.batch?.name || "N/A"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(assignment.dueDate)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center">
                              {assignment.isBriefUploaded && (
                                <button
                                  onClick={() =>
                                    handleDownloadBrief(assignment.id)
                                  }
                                  className="text-green-600 hover:text-green-900 "
                                  title="Download Brief"
                                >
                                  <FiDownload className="inline " />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap  text-gray-500 space-x-2">
                              <button
                                onClick={() =>
                                  setSelectedAssignment(assignment)
                                }
                                className="text-blue-600 hover:text-blue-900 text-[10px] "
                                title="View Submissions"
                              >
                                <FiEye className="inline mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentIssuer;
