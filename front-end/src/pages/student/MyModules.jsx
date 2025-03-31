import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Modules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Fetch modules for the user's enrolled batch
  useEffect(() => {
    if (!user || !user.enrolledBatch) {
      setIsLoading(false);
      return;
    }

    const fetchUserModules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all batches to find the user's enrolled batch
        const batchesResponse = await apiClient.get("/batches");
        const allBatches = batchesResponse.data;

        // Find the user's enrolled batch
        const userBatch = allBatches.find(
          (batch) => batch.id === user.enrolledBatch.id
        );

        if (!userBatch) {
          throw new Error("Batch not found");
        }

        // Get the course details from the courses endpoint
        const courseResponse = await apiClient.get(
          `/courses/${userBatch.course.id}`
        );
        const course = courseResponse.data;

        // Get the modules from the course
        if (course.modules && course.modules.length > 0) {
          // Check if modules are full objects or just IDs
          if (typeof course.modules[0] === "object") {
            setModules(course.modules);
          } else {
            // Fetch each module individually if they're just IDs
            const modulePromises = course.modules.map((moduleId) =>
              apiClient.get(`/modules/${moduleId}`)
            );
            const moduleResponses = await Promise.all(modulePromises);
            const fullModules = moduleResponses.map((res) => res.data);
            setModules(fullModules);
          }
        } else {
          setModules([]);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch modules";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserModules();
  }, [user]);

  if (isLoading) return <p className="text-center p-4">Loading modules...</p>;
  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">My Modules</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 flex-grow">
        {/* Modules List View */}
        {!selectedModule && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.length === 0 ? (
              <p className="text-center text-gray-500 col-span-full">
                No modules found for your enrolled batch.
              </p>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-blue-700">
                    {module.title}
                  </h3>
                  <p className="text-gray-700 mt-2 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
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
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedModule.title}
              </h2>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Description:</span>
                <p className="mt-1 whitespace-pre-line">
                  {selectedModule.description}
                </p>
              </div>
              {selectedModule.time && (
                <p>
                  <span className="font-semibold">Schedule:</span>{" "}
                  {selectedModule.time}
                </p>
              )}
              {selectedModule.location && (
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedModule.location}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Modules
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules;
