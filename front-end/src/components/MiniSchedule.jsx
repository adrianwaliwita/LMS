// src/components/Schedule.jsx
import React from "react";

const Schedule = () => {
  const scheduleData = [
    { course: "Math 101", time: "Monday 9 AM", location: "Room A1" },
    { course: "Physics 202", time: "Wednesday 2 PM", location: "Lab B2" },
    { course: "CS 305", time: "Friday 11 AM", location: "Room C3" },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-black">Schedule</h2>
      <div className="bg-white border-2 border-blue-700 w-full md:max-w-lg p-4 rounded-lg shadow text-black">
        <ul className="space-y-3">
          {scheduleData.map((classItem, index) => (
            <li
              key={index}
              className="pb-3 border-b border-gray-200 last:border-0 last:pb-0"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <strong className="text-blue-700">{classItem.course}</strong>
                <div className="mt-1 sm:mt-0">
                  <span>{classItem.time}</span>
                  <span className="ml-2 font-semibold text-gray-700">
                    ({classItem.location})
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Schedule;
