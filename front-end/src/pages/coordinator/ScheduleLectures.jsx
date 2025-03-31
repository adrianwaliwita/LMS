import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LectureScheduler = () => {
  const { user, token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    batchId: "",
    moduleId: "",
    title: "",
    scheduledFrom: new Date(),
    scheduledTo: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 hour
    lecturerId: "",
    classroomIds: [],
    equipment: [],
  });
  const [availableResources, setAvailableResources] = useState(null);
  const [showResourceCheck, setShowResourceCheck] = useState(false);
  const [equipmentSelection, setEquipmentSelection] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [viewMode, setViewMode] = useState("schedule"); // 'schedule' or 'booked'
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, modulesRes, lecturesRes] = await Promise.all([
          apiClient.get("/batches"),
          apiClient.get("/modules"),
          apiClient.get("/lectures"),
        ]);
        setBatches(batchesRes.data);
        setModules(modulesRes.data);
        setLectures(lecturesRes.data);
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

  // Filter lectures based on search term
  const filteredLectures = lectures.filter((lecture) => {
    return (
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lecture.module?.title &&
        lecture.module.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (lecture.batch?.name &&
        lecture.batch.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Check if time is aligned to 30-minute slots
  const isTimeAligned = (date) => {
    const minutes = date.getMinutes();
    return minutes === 0 || minutes === 30;
  };

  // Round time to nearest 30-minute slot
  const roundToNearest30 = (date) => {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    if (minutes > 0 && minutes < 30) {
      rounded.setMinutes(30);
      rounded.setSeconds(0);
      rounded.setMilliseconds(0);
    } else if (minutes > 30) {
      rounded.setHours(rounded.getHours() + 1);
      rounded.setMinutes(0);
      rounded.setSeconds(0);
      rounded.setMilliseconds(0);
    }
    return rounded;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    const roundedDate = roundToNearest30(date);
    setFormData((prev) => ({ ...prev, [name]: roundedDate }));
  };

  // Check resource availability
  const checkResourceAvailability = async () => {
    if (!formData.batchId || !formData.moduleId) {
      toast.error("Please select both batch and module first");
      return;
    }

    if (formData.scheduledFrom >= formData.scheduledTo) {
      toast.error("End time must be after start time");
      return;
    }

    if (!isTimeAligned(formData.scheduledFrom)) {
      toast.error(
        "Start time must be aligned to 30-minute slots (e.g., 9:00, 9:30)"
      );
      return;
    }

    if (!isTimeAligned(formData.scheduledTo)) {
      toast.error(
        "End time must be aligned to 30-minute slots (e.g., 10:00, 10:30)"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        "/lectures/find-available-resources",
        {
          params: {
            batchId: formData.batchId,
            moduleId: formData.moduleId,
            fromDateTime: formData.scheduledFrom.toISOString(),
            toDateTime: formData.scheduledTo.toISOString(),
          },
        }
      );
      setAvailableResources(response.data);
      setShowResourceCheck(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to check resource availability";
      toast.error(errorMessage);
    }
  };

  // Handle equipment selection
  const handleEquipmentChange = (equipmentId, quantity) => {
    setEquipmentSelection((prev) => ({
      ...prev,
      [equipmentId]: quantity,
    }));
  };

  // Add selected equipment to form data
  const addEquipmentToForm = () => {
    const equipmentArray = Object.entries(equipmentSelection)
      .filter(([_, quantity]) => quantity > 0)
      .map(([equipmentId, quantity]) => ({
        equipmentId: parseInt(equipmentId),
        quantity: parseInt(quantity),
      }));

    setSelectedEquipment(equipmentArray);
    setFormData((prev) => ({ ...prev, equipment: equipmentArray }));
  };

  // Schedule lecture
  const scheduleLecture = async (e) => {
    e.preventDefault();
    try {
      const lectureData = {
        ...formData,
        scheduledFrom: formData.scheduledFrom.toISOString(),
        scheduledTo: formData.scheduledTo.toISOString(),
        classroomIds: formData.classroomIds.map(Number),
      };

      const response = await apiClient.post("/lectures", lectureData);
      setLectures([...lectures, response.data]);
      toast.success("Lecture scheduled successfully!");
      resetForm();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to schedule lecture";
      toast.error(errorMessage);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      batchId: "",
      moduleId: "",
      title: "",
      scheduledFrom: new Date(),
      scheduledTo: new Date(new Date().getTime() + 60 * 60 * 1000),
      lecturerId: "",
      classroomIds: [],
      equipment: [],
    });
    setAvailableResources(null);
    setShowResourceCheck(false);
    setEquipmentSelection({});
    setSelectedEquipment([]);
  };

  // Delete a lecture
  const handleDeleteLecture = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecture?"))
      return;
    try {
      await apiClient.delete(`/lectures/${id}`);
      setLectures(lectures.filter((lecture) => lecture.id !== id));
      if (selectedLecture && selectedLecture.id === id) {
        setSelectedLecture(null);
      }
      toast.success("Lecture deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete lecture";
      toast.error(errorMessage);
    }
  };

  if (loading) return <p className="text-center p-4">Loading data...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Lecture Scheduling</h1>
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
              setViewMode("schedule");
              setSelectedLecture(null);
              setShowResourceCheck(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              viewMode === "schedule"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Schedule New Lecture
          </button>
          <button
            onClick={() => {
              setViewMode("booked");
              setSelectedLecture(null);
              setShowResourceCheck(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              viewMode === "booked"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            View Booked Lectures
          </button>
        </div>

        {/* Booked Lectures View */}
        {viewMode === "booked" && !selectedLecture && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
            </div>

            {filteredLectures.length === 0 ? (
              <p className="text-center text-gray-500">No lectures found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-lg font-semibold cursor-pointer text-blue-700"
                        onClick={() => setSelectedLecture(lecture)}
                      >
                        {lecture.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Module:</span>{" "}
                      {lecture.module?.title || "Not specified"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Batch:</span>{" "}
                      {lecture.batch?.name || "Not specified"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(lecture.scheduledFrom).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Time:</span>{" "}
                      {new Date(lecture.scheduledFrom).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(lecture.scheduledTo).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="mt-3 flex justify-between">
                      <button
                        onClick={() => setSelectedLecture(lecture)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(lecture.id)}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lecture Detail View */}
        {selectedLecture && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedLecture.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLecture(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Module:</span>{" "}
                {selectedLecture.module?.title || "Not specified"}
              </p>
              <p>
                <span className="font-semibold">Batch:</span>{" "}
                {selectedLecture.batch?.name || "Not specified"}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedLecture.scheduledFrom).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {new Date(selectedLecture.scheduledFrom).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}{" "}
                -{" "}
                {new Date(selectedLecture.scheduledTo).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <span className="font-semibold">Lecturer:</span>{" "}
                {selectedLecture.lecturer
                  ? `${selectedLecture.lecturer.firstName} ${selectedLecture.lecturer.lastName}`
                  : "Not assigned"}
              </p>
              {selectedLecture.classrooms &&
                selectedLecture.classrooms.length > 0 && (
                  <p>
                    <span className="font-semibold">Classrooms:</span>{" "}
                    {selectedLecture.classrooms.map((c) => c.name).join(", ")}
                  </p>
                )}
              {selectedLecture.equipment &&
                selectedLecture.equipment.length > 0 && (
                  <div>
                    <span className="font-semibold">Equipment:</span>
                    <ul className="list-disc pl-5 mt-1">
                      {selectedLecture.equipment.map((eq, index) => (
                        <li key={index}>
                          {eq.equipment?.name}: {eq.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedLecture(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Lectures
              </button>
              <button
                onClick={() => handleDeleteLecture(selectedLecture.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Lecture
              </button>
            </div>
          </div>
        )}

        {/* Schedule New Lecture Form */}
        {viewMode === "schedule" && !selectedLecture && (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-blue-700">
              {showResourceCheck
                ? "Confirm Lecture Details"
                : "Schedule New Lecture"}
            </h2>

            <form onSubmit={scheduleLecture} className="space-y-4">
              {!showResourceCheck ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch
                      </label>
                      <select
                        name="batchId"
                        value={formData.batchId}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Module
                      </label>
                      <select
                        name="moduleId"
                        value={formData.moduleId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      >
                        <option value="">Select a module</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lecture Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      placeholder="Enter lecture title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <DatePicker
                        selected={formData.scheduledFrom}
                        onChange={(date) =>
                          handleDateChange("scheduledFrom", date)
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <DatePicker
                        selected={formData.scheduledTo}
                        onChange={(date) =>
                          handleDateChange("scheduledTo", date)
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={checkResourceAvailability}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Check Resource Availability
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {availableResources && (
                    <div className="mt-4">
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">
                          Available Lecturers
                        </h4>
                        <div className="space-y-2">
                          {availableResources.lecturers.length > 0 ? (
                            availableResources.lecturers.map((lecturer) => (
                              <div
                                key={lecturer.id}
                                className="flex items-center p-2 border rounded-lg hover:bg-gray-50"
                              >
                                <input
                                  type="radio"
                                  id={`lecturer-${lecturer.id}`}
                                  name="lecturerId"
                                  value={lecturer.id}
                                  checked={formData.lecturerId === lecturer.id}
                                  onChange={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      lecturerId: lecturer.id,
                                    }))
                                  }
                                  className="mr-2"
                                />
                                <label htmlFor={`lecturer-${lecturer.id}`}>
                                  {lecturer.firstName} {lecturer.lastName} (
                                  {lecturer.email})
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">
                              No available lecturers
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium mb-2">
                          Available Classrooms
                        </h4>
                        <div className="space-y-2">
                          {availableResources.classrooms.length > 0 ? (
                            availableResources.classrooms.map((classroom) => (
                              <div
                                key={classroom.id}
                                className="flex items-center p-2 border rounded-lg hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  id={`classroom-${classroom.id}`}
                                  checked={formData.classroomIds.includes(
                                    classroom.id.toString()
                                  )}
                                  onChange={(e) => {
                                    const newClassroomIds = e.target.checked
                                      ? [
                                          ...formData.classroomIds,
                                          classroom.id.toString(),
                                        ]
                                      : formData.classroomIds.filter(
                                          (id) => id !== classroom.id.toString()
                                        );
                                    setFormData((prev) => ({
                                      ...prev,
                                      classroomIds: newClassroomIds,
                                    }));
                                  }}
                                  className="mr-2"
                                />
                                <label htmlFor={`classroom-${classroom.id}`}>
                                  {classroom.name} (Capacity:{" "}
                                  {classroom.capacity})
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">
                              No available classrooms
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium mb-2">
                          Available Equipment
                        </h4>
                        {availableResources.equipment.length > 0 ? (
                          <>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Equipment
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Available
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request Quantity
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {availableResources.equipment.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {item.name} ({item.description})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {item.availableQuantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        min="0"
                                        max={item.availableQuantity}
                                        value={equipmentSelection[item.id] || 0}
                                        onChange={(e) =>
                                          handleEquipmentChange(
                                            item.id,
                                            e.target.value
                                          )
                                        }
                                        className="w-20 px-2 py-1 border rounded"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button
                              type="button"
                              onClick={addEquipmentToForm}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Add Selected Equipment
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-500">No equipment needed</p>
                        )}
                      </div>

                      {selectedEquipment.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium mb-2">
                            Selected Equipment
                          </h4>
                          <ul className="list-disc pl-5">
                            {selectedEquipment.map((item) => {
                              const equipment =
                                availableResources.equipment.find(
                                  (e) => e.id === item.equipmentId
                                );
                              return (
                                <li key={item.equipmentId}>
                                  {equipment?.name}: {item.quantity}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end gap-4 mt-6">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={scheduleLecture}
                          disabled={
                            !formData.lecturerId ||
                            formData.classroomIds.length === 0
                          }
                          className={`px-4 py-2 rounded-lg ${
                            !formData.lecturerId ||
                            formData.classroomIds.length === 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-700 text-white hover:bg-blue-800"
                          }`}
                        >
                          Schedule Lecture
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureScheduler;
