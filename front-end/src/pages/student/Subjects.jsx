import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Import your auth context

const baseUrl = import.meta.env.VITE_BASE_URL;

const Subjects = () => {
  const { user } = useAuth(); // Get the current logged-in user

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    time: "",
    instructor: "",
    location: "",
    description: "",
  });

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
      setSubjects([]);
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({
      ...newSubject,
      [name]: value,
    });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();

    // First create the subject
    axios
      .post(`${baseUrl}/subjects`, newSubject)
      .then((response) => {
        const newSubjectData = response.data;

        // Then add the subject ID to the user's SubjectIDs array
        if (user) {
          // Create an updated user object with the new subject ID
          const updatedUser = { ...user };
          if (!updatedUser.SubjectIDs) {
            updatedUser.SubjectIDs = [];
          }
          updatedUser.SubjectIDs.push(newSubjectData.id);

          // Update the user in the database
          return axios
            .put(`${baseUrl}/users/${user.id}`, updatedUser)
            .then(() => newSubjectData);
        }
        return newSubjectData;
      })
      .then((newSubjectData) => {
        setSubjects([...subjects, newSubjectData]);
        setNewSubject({
          name: "",
          time: "",
          instructor: "",
          location: "",
          description: "",
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding subject:", error);
      });
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    const updatedSubject = { ...newSubject };
    axios
      .put(`${baseUrl}/subjects/${editingId}`, updatedSubject)
      .then(() => {
        const updatedSubjects = subjects.map((subj) =>
          subj.id === editingId ? { ...subj, ...updatedSubject } : subj
        );
        setSubjects(updatedSubjects);
        setNewSubject({
          name: "",
          time: "",
          instructor: "",
          location: "",
          description: "",
        });
        setEditingId(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating subject:", error);
      });
  };

  const handleDeleteSubject = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject assignment? This action cannot be undone."
    );
    if (confirmed) {
      // Remove the subject ID from the user's SubjectIDs array
      if (user && user.SubjectIDs) {
        const updatedUser = { ...user };
        updatedUser.SubjectIDs = updatedUser.SubjectIDs.filter(
          (subjectId) => subjectId !== id
        );

        // Update the user in the database
        axios
          .put(`${baseUrl}/users/${user.id}`, updatedUser)
          .then(() => {
            // Update the UI by removing the subject
            setSubjects(subjects.filter((subj) => subj.id !== id));
          })
          .catch((error) => {
            console.error("Error removing subject assignment:", error);
          });
      }
    }
  };

  // Reset form on cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewSubject({
      name: "",
      time: "",
      instructor: "",
      location: "",
      description: "",
    });
  };

  if (!user) return <p>Please log in to view your subjects.</p>;

  if (loading) return <p>Loading subjects...</p>;

  return (
    <div className="flex min-h-screen mr-0">
      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 py-6 md:py-10">
        <h1 className="text-2xl font-bold mb-6 text-black">My Subjects</h1>

        {/* Subjects List */}
        {!selectedSubject ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.length === 0 ? (
              <p className="text-gray-500 py-4 text-center ">
                No subjects found for your account.
              </p>
            ) : (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border-2 border-blue-700 p-4 rounded-lg shadow bg-white cursor-pointer hover:shadow-md transition-shadow "
                >
                  <h3 className=" text-lg font-semibold text-blue-700">
                    {subject.name}
                  </h3>
                  <p className="mt-4 text-gray-700">
                    <span className="font-semibold">Time:</span> {subject.time}
                  </p>{" "}
                  <p className="text-gray-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {subject.location}
                  </p>
                  <button
                    onClick={() => setSelectedSubject(subject)}
                    className="w-full text-sm text-blue-700 hover:underline border-2 max-w-[200px] border-blue-700 rounded-lg py-2 px-4 mt-4"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Subject Details View
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow max-w-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              {selectedSubject.name}
            </h2>
            <div className="space-y-3">
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Credits:</span>{" "}
                {selectedSubject.credits}
              </p>
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Schedule:</span>{" "}
                {selectedSubject.time}
              </p>
              <p className="pb-2 border-b border-gray-200">
                <span className="font-semibold">Location:</span>{" "}
                {selectedSubject.location}
              </p>
              <p className="pb-2">
                <span className="font-semibold">Description:</span>{" "}
                {selectedSubject.description}
              </p>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              onClick={() => setSelectedSubject(null)}
            >
              Back to Subjects List
            </button>
          </div>
        )}

        {/* Add/Edit Subject buttons only shown for admin users */}
        {user && user.role === "admin" && (
          <>
            {!showForm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  + Add New Subject
                </button>
              </div>
            )}

            {/* Add/Edit Subject Form */}
            {showForm && (
              <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow mt-6">
                <h3 className="text-xl font-bold mb-4 text-blue-700">
                  {editingId ? "Edit Subject" : "Add New Subject"}
                </h3>
                <form
                  onSubmit={editingId ? handleUpdateSubject : handleAddSubject}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newSubject.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule
                      </label>
                      <input
                        type="text"
                        name="time"
                        value={newSubject.time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credits
                      </label>
                      <input
                        type="number"
                        name="credits"
                        value={newSubject.credits || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newSubject.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newSubject.description}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                    >
                      {editingId ? "Update Subject" : "Add Subject"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="border-2 border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Subjects;
