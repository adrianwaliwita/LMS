import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const Schedule = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date to local time string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format time range
  const formatTimeRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Fetch lectures for the user's enrolled batch
  useEffect(() => {
    if (!user || !user.enrolledBatch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchUserLectures = async () => {
      try {
        // First get all lectures using apiClient
        const response = await apiClient.get("/lectures");
        const allLectures = response.data;

        // Filter lectures for the user's batch
        const userLectures = allLectures.filter(
          (lecture) => lecture.batch?.id === user.enrolledBatch.id
        );

        // Sort lectures by scheduledFrom date
        const sortedLectures = userLectures.sort(
          (a, b) => new Date(a.scheduledFrom) - new Date(b.scheduledFrom)
        );

        setLectures(sortedLectures);
      } catch (error) {
        console.error("Error fetching lectures:", error);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLectures();
  }, [user]);

  if (loading) return <p className="text-black">Loading schedule...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">My Schedule</h2>

      <div className="bg-white border-2 border-blue-700 rounded-lg shadow overflow-hidden">
        {lectures.length === 0 ? (
          <p className="text-gray-500 p-4 text-center">
            No lectures scheduled for your batch.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {lectures.map((lecture) => (
              <li
                key={lecture.id}
                className="p-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {lecture.module?.title || "No module assigned"}
                      </h3>
                      {lecture.title && (
                        <span className="text-sm text-gray-600">
                          - {lecture.title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Lecturer: {lecture.lecturer?.firstName}{" "}
                      {lecture.lecturer?.lastName}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="font-medium text-black">
                      {formatDate(lecture.scheduledFrom)}
                    </div>
                    <div className="text-sm text-gray-700">
                      {formatTimeRange(
                        lecture.scheduledFrom,
                        lecture.scheduledTo
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="font-medium">Location:</span>
                    {lecture.classrooms?.length > 0 ? (
                      lecture.classrooms.map((classroom) => (
                        <span
                          key={classroom.id}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {classroom.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Schedule;
