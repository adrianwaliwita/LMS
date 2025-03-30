import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

const ModuleManagement = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesRes = await apiClient.get("/modules");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const response = await apiClient.patch(
          `/modules/${selectedModule.id}`,
          moduleFormData
        );
        setModules(
          modules.map((m) => (m.id === selectedModule.id ? response.data : m))
        );
        toast.success(`Module "${moduleFormData.title}" updated successfully`);
      } else {
        const response = await apiClient.post("/modules", moduleFormData);
        setModules([...modules, response.data]);
        toast.success(`Module "${moduleFormData.title}" created successfully`);
      }
      resetForm();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} module`;
      toast.error(errorMessage);
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    try {
      await apiClient.delete(`/modules/${id}`);
      setModules(modules.filter((module) => module.id !== id));
      if (selectedModule?.id === id) setSelectedModule(null);
      toast.success("Module deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete module";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setModuleFormData({
      title: "",
      description: "",
    });
    setIsEditMode(false);
    setShowForm(false);
    setSelectedModule(null);
  };

  const handleEditSetup = (module) => {
    setModuleFormData({
      title: module.title,
      description: module.description || "",
    });
    setSelectedModule(module);
    setIsEditMode(true);
    setShowForm(true);
  };

  const filteredModules = modules.filter((module) => {
    return (
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description &&
        module.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading modules...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Module Management</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 flex-grow">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!selectedModule && !showForm && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
              />
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Module
              </button>
            </div>

            {filteredModules.length === 0 ? (
              <p className="text-center text-gray-500">
                No modules found matching your criteria.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredModules.map((module) => (
                  <div
                    key={module.id}
                    className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedModule(module)}
                    >
                      {module.title}
                    </h3>
                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {module.description || "No description available"}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setSelectedModule(module)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode ? "Edit Module" : "Add New Module"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={moduleFormData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  placeholder="Module title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={moduleFormData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  rows="3"
                  placeholder="Module description"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  {isEditMode ? "Update Module" : "Add Module"}
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedModule && !showForm && (
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
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {selectedModule.description || "No description available"}
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to Modules
              </button>
              <button
                onClick={() => handleEditSetup(selectedModule)}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit Module
              </button>
              <button
                onClick={() => handleDeleteModule(selectedModule.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Delete Module
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManagement;
