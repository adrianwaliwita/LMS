import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const Schedule = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch subjects assigned to the current user
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Check if the user has SubjectIDs field
    if (user.SubjectIDs && Array.isArray(user.SubjectIDs)) {
      // Fetch subject details for each subject ID
      const fetchSubjectDetails = async () => {
        try {
          const userSubjectsPromises = user.SubjectIDs.map((subjectId) =>
            axios.get(`${baseUrl}/subjects/${subjectId}`)
          );

          const subjectResponses = await Promise.all(userSubjectsPromises);
          const userSubjects = subjectResponses.map(
            (response) => response.data
          );

          setSubjects(userSubjects);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching subject details:", error);
          setLoading(false);
        }
      };

      fetchSubjectDetails();
    } else {
      // If user doesn't have SubjectIDs field, set empty subjects array
      console.log("User has no SubjectIDs or it's not an array");
      setSubjects([]);
      setLoading(false);
    }
  }, [user]);

  if (loading) return <p>Loading schedule...</p>;

  return (
    <>
      <h2 className="text-2xl font-bold mb-6  text-black">Schedule</h2>
      <div className="bg-white border-2 border-blue-700  md:max-w-[50vw] p-4 rounded-lg shadow text-black ">
        {subjects.length === 0 ? (
          <p className="text-gray-500 py-2 text-center">
            No subjects found in your schedule.
          </p>
        ) : (
          <ul className="space-y-3 ">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="pb-3 border-b border-gray-200 last:border-0 last:pb-0 "
              >
                <div className="flex flex-col sm:flex-row sm:justify-between  ">
                  <strong className="text-blue-700 w-1/2 ">
                    {subject.name}
                  </strong>
                  <div className="mt-1 sm:mt-0 ">
                    <span className="">{subject.time}</span>
                    <br />
                    <span className=" font-semibold text-gray-700 text-left">
                      ({subject.location})
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Schedule;
