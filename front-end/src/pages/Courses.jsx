// src/components/Courses.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      id: 1,
      name: "Math 101",
      time: "Monday 9:00 AM - 11:00 AM",
      instructor: "Dr. Smith",
      location: "Room A1",
      description: "Introduction to Mathematics",
    },
    {
      id: 2,
      name: "Physics 202",
      time: "Wednesday 2:00 PM - 4:00 PM",
      instructor: "Prof. Johnson",
      location: "Lab B2",
      description: "Fundamentals of Physics",
    },
    {
      id: 3,
      name: "CS 305",
      time: "Friday 11:00 AM - 1:00 PM",
      instructor: "Dr. Lee",
      location: "Room C3",
      description: "Data Structures and Algorithms",
    },
  ];

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar - hidden on mobile, visible on md breakpoint and up */}

      {/* Course content - full width on mobile, adjusted on larger screens */}
      <div className="w-full md:w-3/4 lg:w-4/5 px-4 md:px-6 py-6 md:py-10">
        {!selectedCourse ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-blue-700">My Courses</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border-2 border-blue-700 p-4 rounded-lg shadow bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCourseClick(course)}
                >
                  <h3 className="text-lg font-semibold text-blue-700">
                    {course.name}
                  </h3>
                  <p className="text-gray-700 mt-2">{course.time}</p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {course.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow w-full max-w-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              {selectedCourse.name}
            </h2>

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

            <button
              className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              onClick={() => setSelectedCourse(null)}
            >
              Back to Course List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
