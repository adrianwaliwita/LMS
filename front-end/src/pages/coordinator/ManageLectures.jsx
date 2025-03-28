import React, { useState, useEffect } from "react";
import axios from "axios";

const LectureBooking = () => {
  // State for dropdown options and selection stages
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // Selection states
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  // Form data state
  const [lectureFormData, setLectureFormData] = useState({
    courseId: "",
    batchId: "",
    moduleId: "",
    lecturerId: "",
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    equipmentIds: [],
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Base URL for API calls
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/courses`);
        setCourses(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch courses");
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle course selection
  const handleCourseSelect = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedBatch("");
    setSelectedModule("");

    try {
      // Fetch batches for the selected course
      const batchesResponse = await axios.get(
        `${baseUrl}/batches?courseId=${courseId}`
      );
      setBatches(batchesResponse.data);

      // Reset subsequent dropdowns
      setModules([]);
      setLecturers([]);
      setClassrooms([]);
      setEquipment([]);

      // Update form data
      setLectureFormData((prev) => ({
        ...prev,
        courseId: courseId,
        batchId: "",
        moduleId: "",
      }));
    } catch (err) {
      setError("Failed to fetch batches for the selected course");
    }
  };

  // Handle batch selection
  const handleBatchSelect = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedModule("");

    try {
      // Fetch modules for the selected course and batch
      const modulesResponse = await axios.get(
        `${baseUrl}/modules?courseId=${selectedCourse}&batchId=${batchId}`
      );
      setModules(modulesResponse.data);

      // Reset subsequent dropdowns
      setLecturers([]);
      setClassrooms([]);
      setEquipment([]);

      // Update form data
      setLectureFormData((prev) => ({
        ...prev,
        batchId: batchId,
        moduleId: "",
      }));
    } catch (err) {
      setError("Failed to fetch modules for the selected batch");
    }
  };

  // Handle module selection
  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);

    // Update form data
    setLectureFormData((prev) => ({
      ...prev,
      moduleId: moduleId,
    }));
  };

  // Handle date and time input
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    setLectureFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch lecture availability
  const fetchLectureAvailability = async () => {
    try {
      const response = await axios.get(`${baseUrl}/lecture-availability`, {
        params: {
          courseId: selectedCourse,
          batchId: selectedBatch,
          moduleId: selectedModule,
          date: lectureFormData.date,
          startTime: lectureFormData.startTime,
          endTime: lectureFormData.endTime,
        },
      });

      const { lecturers, classrooms, equipment } = response.data;
      setLecturers(lecturers);
      setClassrooms(classrooms);
      setEquipment(equipment);
    } catch (err) {
      setError("Failed to fetch lecture availability");
    }
  };

  // Create lecture handler
  const handleCreateLecture = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${baseUrl}/lectures`, lectureFormData);
      // Handle successful lecture creation (e.g., show success message, reset form)
      console.log("Lecture created:", response.data);

      // Reset form and states
      setSelectedCourse("");
      setSelectedBatch("");
      setSelectedModule("");
      setLectureFormData({
        courseId: "",
        batchId: "",
        moduleId: "",
        lecturerId: "",
        roomId: "",
        date: "",
        startTime: "",
        endTime: "",
        equipmentIds: [],
      });

      // Reset dropdowns
      setBatches([]);
      setModules([]);
      setLecturers([]);
      setClassrooms([]);
      setEquipment([]);
    } catch (err) {
      setError("Failed to create lecture");
    }
  };

  // Render method with staged selection
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lecture Booking</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Course Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseSelect(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          disabled={isLoading}
        >
          <option value="">Select a Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Selection (only after course is selected) */}
      {selectedCourse && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Batch
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => handleBatchSelect(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">Select a Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Module Selection (only after batch is selected) */}
      {selectedBatch && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => handleModuleSelect(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">Select a Module</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date and Time Input (only after module is selected) */}
      {selectedModule && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={lectureFormData.date}
              onChange={handleDateTimeChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={lectureFormData.startTime}
                onChange={handleDateTimeChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={lectureFormData.endTime}
                onChange={handleDateTimeChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fetch Availability Button */}
      {lectureFormData.date &&
        lectureFormData.startTime &&
        lectureFormData.endTime && (
          <div className="mb-4">
            <button
              onClick={fetchLectureAvailability}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Check Availability
            </button>
          </div>
        )}

      {/* Lecturer Selection */}
      {lecturers.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Lecturer
          </label>
          <select
            name="lecturerId"
            value={lectureFormData.lecturerId}
            onChange={(e) =>
              setLectureFormData((prev) => ({
                ...prev,
                lecturerId: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">Select a Lecturer</option>
            {lecturers.map((lecturer) => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Classroom Selection */}
      {classrooms.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Classroom
          </label>
          <select
            name="roomId"
            value={lectureFormData.roomId}
            onChange={(e) =>
              setLectureFormData((prev) => ({
                ...prev,
                roomId: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">Select a Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} (Capacity: {classroom.capacity})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Equipment Selection */}
      {equipment.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Equipment (Optional)
          </label>
          <select
            multiple
            name="equipmentIds"
            value={lectureFormData.equipmentIds}
            onChange={(e) => {
              const selectedEquipment = Array.from(
                e.target.selectedOptions
              ).map((option) => option.value);
              setLectureFormData((prev) => ({
                ...prev,
                equipmentIds: selectedEquipment,
              }));
            }}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
          >
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Create Lecture Button */}
      {lectureFormData.lecturerId && lectureFormData.roomId && (
        <div>
          <button
            onClick={handleCreateLecture}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Create Lecture
          </button>
        </div>
      )}
    </div>
  );
};

export default LectureBooking;
