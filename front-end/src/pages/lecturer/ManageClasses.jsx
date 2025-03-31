import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [lecturerData, setLecturerData] = useState(null);
  const [scheduledLectures, setScheduledLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [viewMode, setViewMode] = useState("modules"); // 'modules' or 'schedule'
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch lecturer's data and scheduled lectures
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get lecturer's profile data (includes assigned modules)
        const lecturerResponse = await apiClient.get(`/users/${user.id}`);

        // Get lecturer's scheduled lectures using the lecturerId parameter
        const lecturesResponse = await apiClient.get(`/lectures`, {
          params: {
            lecturerId: user.id,
          },
        });

        setLecturerData(lecturerResponse.data);
        setScheduledLectures(lecturesResponse.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch data";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  // Filter lectures based on search term
  const filteredLectures = scheduledLectures.filter((lecture) => {
    return (
      lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lecture.module?.title &&
        lecture.module.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (lecture.batch?.name &&
        lecture.batch.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Filter modules based on search term (when in modules view)
  const filteredModules =
    lecturerData?.assignedModules?.filter((module) => {
      return (
        module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (module.description &&
          module.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }) || [];

  if (loading) return <div className="text-center p-4">Loading data...</div>;
  if (!lecturerData)
    return <div className="text-center p-4">No lecturer data found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
          <p className="text-blue-100">
            Welcome, {lecturerData.firstName} {lecturerData.lastName}
          </p>
          <p className="text-blue-100 text-sm">
            {lecturerData.department?.name || "No department assigned"}
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* View Mode Toggle Buttons */}
        <div className="flex mb-6 space-x-4">
          <button
            onClick={() => {
              setViewMode("modules");
              setSelectedModule(null);
              setSelectedLecture(null);
            }}
            className={`px-4 py-2 rounded-lg ${
              viewMode === "modules"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            My Modules ({lecturerData.assignedModules?.length || 0})
          </button>
          <button
            onClick={() => {
              setViewMode("schedule");
              setSelectedModule(null);
              setSelectedLecture(null);
            }}
            className={`px-4 py-2 rounded-lg ${
              viewMode === "schedule"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            My Schedule ({scheduledLectures.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${
              viewMode === "modules" ? "modules" : "lectures"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
          />
        </div>

        {/* Modules View */}
        {viewMode === "modules" && !selectedModule && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModules.length === 0 ? (
              <div className="col-span-full text-center p-6 bg-white rounded-lg shadow">
                <p className="text-gray-500">No modules assigned to you.</p>
              </div>
            ) : (
              filteredModules.map((module) => (
                <div
                  key={module.id}
                  className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3
                    className="text-lg font-semibold cursor-pointer text-blue-700"
                    onClick={() => setSelectedModule(module)}
                  >
                    {module.title}
                  </h3>
                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {module.description || "No description available"}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
                    <span className="text-xs text-gray-500">
                      {
                        scheduledLectures.filter(
                          (l) => l.module?.id === module.id
                        ).length
                      }{" "}
                      scheduled
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Module Detail View */}
        {selectedModule && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedModule.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedModule(null);
                    setSelectedLecture(null);
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to all modules
                </button>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">
                {selectedModule.description || "No description available"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Scheduled Lectures</h3>
              {scheduledLectures.filter(
                (l) => l.module?.id === selectedModule.id
              ).length > 0 ? (
                <div className="space-y-3">
                  {scheduledLectures
                    .filter((l) => l.module?.id === selectedModule.id)
                    .sort(
                      (a, b) =>
                        new Date(a.scheduledFrom) - new Date(b.scheduledFrom)
                    )
                    .map((lecture) => (
                      <div
                        key={lecture.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedLecture(lecture)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium">{lecture.title}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              lecture.scheduledFrom
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {lecture.batch?.name && (
                            <span>Batch: {lecture.batch.name} • </span>
                          )}
                          {new Date(lecture.scheduledFrom).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(lecture.scheduledTo).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">
                    No lectures scheduled for this module
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule View */}
        {viewMode === "schedule" && !selectedLecture && (
          <div>
            {filteredLectures.length === 0 ? (
              <div className="p-6 bg-white rounded-lg shadow text-center">
                <p className="text-gray-500">No lectures scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group lectures by date */}
                {Object.entries(
                  filteredLectures.reduce((acc, lecture) => {
                    const date = new Date(lecture.scheduledFrom).toDateString();
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(lecture);
                    return acc;
                  }, {})
                )
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, lectures]) => (
                    <div key={date} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-bold text-lg mb-3 text-blue-700">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <div className="space-y-3">
                        {lectures
                          .sort(
                            (a, b) =>
                              new Date(a.scheduledFrom) -
                              new Date(b.scheduledFrom)
                          )
                          .map((lecture) => (
                            <div
                              key={lecture.id}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedLecture(lecture)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">
                                    {lecture.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {lecture.module?.title || "No module"} •{" "}
                                    {lecture.batch?.name || "No batch"}
                                  </p>
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap">
                                  {new Date(
                                    lecture.scheduledFrom
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    lecture.scheduledTo
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Lecture Detail View */}
        {selectedLecture && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedLecture.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedLecture(null);
                    if (selectedModule) {
                      setViewMode("modules");
                    } else {
                      setViewMode("schedule");
                    }
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to {selectedModule ? "module" : "schedule"}
                </button>
              </div>
              <button
                onClick={() => setSelectedLecture(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Module:</span>{" "}
                    {selectedLecture.module?.title || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Batch:</span>{" "}
                    {selectedLecture.batch?.name || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(
                      selectedLecture.scheduledFrom
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date(selectedLecture.scheduledFrom).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    -{" "}
                    {new Date(selectedLecture.scheduledTo).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Resources</h3>
                <div className="space-y-2">
                  {selectedLecture.classrooms &&
                    selectedLecture.classrooms.length > 0 && (
                      <p>
                        <span className="font-medium">Classrooms:</span>{" "}
                        {selectedLecture.classrooms
                          .map((c) => c.name)
                          .join(", ")}
                      </p>
                    )}
                  {selectedLecture.reservedEquipment &&
                    selectedLecture.reservedEquipment.length > 0 && (
                      <div>
                        <span className="font-medium">Equipment:</span>
                        <ul className="list-disc pl-5 mt-1">
                          {selectedLecture.reservedEquipment.map(
                            (eq, index) => (
                              <li key={index}>
                                {eq.name}: {eq.quantity}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLecture(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerDashboard;
