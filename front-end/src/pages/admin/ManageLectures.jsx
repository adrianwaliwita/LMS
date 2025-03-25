import React, { useState, useEffect } from "react";
import axios from "axios";

const LectureBooking = () => {
  // State for dropdown options
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // Lectures state
  const [lectures, setLectures] = useState([]);
  const [lectureConflicts, setLectureConflicts] = useState([]);

  // Form data state
  const [lectureFormData, setLectureFormData] = useState({
    title: "",
    courseId: "",
    batchId: "",
    moduleId: "",
    lecturerId: "",
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    equipmentIds: [],
  });

  // Base URL for API calls
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/courses`),
      axios.get(`${baseUrl}/batches`),
      axios.get(`${baseUrl}/subjects`),
      axios.get(`${baseUrl}/users?role=lecturer`),
      axios.get(`${baseUrl}/classrooms`),
      axios.get(`${baseUrl}/equipment`),
      axios.get(`${baseUrl}/lectures`),
    ])
      .then(
        ([
          coursesResponse,
          batchesResponse,
          subjectsResponse,
          lecturersResponse,
          classroomsResponse,
          equipmentResponse,
          lecturesResponse,
        ]) => {
          setCourses(coursesResponse.data);
          setBatches(batchesResponse.data);
          setSubjects(subjectsResponse.data);
          setLecturers(lecturersResponse.data);
          setClassrooms(classroomsResponse.data);
          setEquipment(equipmentResponse.data);
          setLectures(lecturesResponse.data);
        }
      )
      .catch((error) => {
        console.error("Error fetching initial data:", error);
      });
  }, []);

  // Conflict checking function
  const checkLectureConflicts = (newLecture) => {
    return lectures.filter(
      (existingLecture) =>
        existingLecture.roomId === newLecture.roomId &&
        existingLecture.date === newLecture.date &&
        ((newLecture.startTime >= existingLecture.startTime &&
          newLecture.startTime < existingLecture.endTime) ||
          (newLecture.endTime > existingLecture.startTime &&
            newLecture.endTime <= existingLecture.endTime) ||
          (newLecture.startTime <= existingLecture.startTime &&
            newLecture.endTime >= existingLecture.endTime))
    );
  };

  // Form change handler
  const handleLectureFormChange = (e) => {
    const { name, value, type, options } = e.target;

    if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setLectureFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));
    } else {
      setLectureFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Create lecture handler
  const handleCreateLecture = (e) => {
    e.preventDefault();

    // Check for conflicts
    const conflicts = checkLectureConflicts(lectureFormData);

    if (conflicts.length > 0) {
      setLectureConflicts(conflicts);
      alert("There are scheduling conflicts for this lecture!");
      return;
    }

    axios
      .post(`${baseUrl}/lectures`, lectureFormData)
      .then((response) => {
        setLectures([...lectures, response.data]);
        resetLectureForm();
        setLectureConflicts([]);
      })
      .catch((error) => {
        console.error("Error creating lecture:", error);
        alert("Failed to create lecture. Please check all fields.");
      });
  };

  // Reset lecture form
  const resetLectureForm = () => {
    setLectureFormData({
      title: "",
      courseId: "",
      batchId: "",
      moduleId: "",
      lecturerId: "",
      roomId: "",
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      equipmentIds: [],
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lecture Booking</h1>

      {/* Conflicts Warning */}
      {lectureConflicts.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Scheduling Conflicts Detected!</strong>
          <ul className="list-disc list-inside mt-2">
            {lectureConflicts.map((conflict, index) => (
              <li key={index}>
                Conflict with {conflict.title} on {conflict.date}
                from {conflict.startTime} to {conflict.endTime}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lecture Booking Form */}
      <form onSubmit={handleCreateLecture} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lecture Title
          </label>
          <input
            type="text"
            name="title"
            value={lectureFormData.title}
            onChange={handleLectureFormChange}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              name="courseId"
              value={lectureFormData.courseId}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
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
              value={lectureFormData.batchId}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module
            </label>
            <select
              name="moduleId"
              value={lectureFormData.moduleId}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Module</option>
              {subjects.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecturer
            </label>
            <select
              name="lecturerId"
              value={lectureFormData.lecturerId}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              name="roomId"
              value={lectureFormData.roomId}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Room</option>
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment
            </label>
            <select
              multiple
              name="equipmentIds"
              value={lectureFormData.equipmentIds}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={lectureFormData.date}
              onChange={handleLectureFormChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={lectureFormData.startTime}
                onChange={handleLectureFormChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={lectureFormData.endTime}
                onChange={handleLectureFormChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={lectureFormData.description}
            onChange={handleLectureFormChange}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
            rows="3"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={resetLectureForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Book Lecture
          </button>
        </div>
      </form>

      {/* Booked Lectures List */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Booked Lectures</h2>
        {lectures.length === 0 ? (
          <p className="text-gray-500">No lectures have been booked yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{lecture.title}</h3>
                  <span className="text-sm text-gray-600">{lecture.date}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Time:</strong> {lecture.startTime} -{" "}
                    {lecture.endTime}
                  </p>
                  <p>
                    <strong>Room:</strong>{" "}
                    {
                      classrooms.find((room) => room.id === lecture.roomId)
                        ?.name
                    }
                  </p>
                  <p>
                    <strong>Course:</strong>{" "}
                    {
                      courses.find((course) => course.id === lecture.courseId)
                        ?.name
                    }
                  </p>
                  <p>
                    <strong>Lecturer:</strong>{" "}
                    {
                      lecturers.find(
                        (lecturer) => lecturer.id === lecture.lecturerId
                      )?.name
                    }
                  </p>
                </div>
                {lecture.description && (
                  <p className="mt-2 text-gray-600 italic text-sm">
                    {lecture.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureBooking;
