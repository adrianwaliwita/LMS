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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, modulesRes] = await Promise.all([
          apiClient.get("/batches"),
          apiClient.get("/modules"),
        ]);
        setBatches(batchesRes.data);
        setModules(modulesRes.data);
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
        "/lectures/list-available-resources",
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

        <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-700">
            Schedule New Lecture
          </h2>

          <form onSubmit={scheduleLecture} className="space-y-4">
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
                  onChange={(date) => handleDateChange("scheduledFrom", date)}
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
                  onChange={(date) => handleDateChange("scheduledTo", date)}
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
          </form>

          {showResourceCheck && availableResources && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Available Resources
              </h3>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Available Lecturers</h4>
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
                    <p className="text-gray-500">No available lecturers</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Available Classrooms</h4>
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
                          {classroom.name} (Capacity: {classroom.capacity})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No available classrooms</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Available Equipment</h4>
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
                                  handleEquipmentChange(item.id, e.target.value)
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
                  <h4 className="font-medium mb-2">Selected Equipment</h4>
                  <ul className="list-disc pl-5">
                    {selectedEquipment.map((item) => {
                      const equipment = availableResources.equipment.find(
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
                    !formData.lecturerId || formData.classroomIds.length === 0
                  }
                  className={`px-4 py-2 rounded-lg ${
                    !formData.lecturerId || formData.classroomIds.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                >
                  Schedule Lecture
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureScheduler;
