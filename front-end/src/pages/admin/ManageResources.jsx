import React, { useState, useEffect } from "react";
import axios from "axios";

const ResourceManagement = () => {
  // State for classrooms and equipment
  const [classrooms, setClassrooms] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceType, setResourceType] = useState("classrooms");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form Data States for classrooms and equipment
  const [classroomFormData, setClassroomFormData] = useState({
    name: "",
    capacity: "",
    description: "",
    hasProjector: false,
    hasWhiteboard: false,
    hasComputers: false,
    computerCount: 0,
  });

  const [equipmentFormData, setEquipmentFormData] = useState({
    name: "",
    description: "",
    lastMaintenance: "",
    nextMaintenance: "",
  });

  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  // Fetch classrooms and equipment on component mount
  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/classrooms`),
      axios.get(`${baseUrl}/equipment`),
    ])
      .then(([classroomsResponse, equipmentResponse]) => {
        setClassrooms(classroomsResponse.data);
        setEquipment(equipmentResponse.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
        setLoading(false);
      });
  }, []);

  // Common form change handler
  const handleFormChange = (e, formType) => {
    const { name, value, type, checked } = e.target;
    if (formType === "classroom") {
      setClassroomFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setEquipmentFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Create Resource
  const handleCreateResource = (e) => {
    e.preventDefault();
    const endpoint = resourceType === "classrooms" ? "classrooms" : "equipment";
    const data =
      resourceType === "classrooms" ? classroomFormData : equipmentFormData;

    axios
      .post(`${baseUrl}/${endpoint}`, data)
      .then((response) => {
        if (resourceType === "classrooms") {
          setClassrooms([...classrooms, response.data]);
        } else {
          setEquipment([...equipment, response.data]);
        }
        resetForm();
      })
      .catch((error) => {
        console.error(`Error creating ${resourceType}:`, error);
      });
  };

  // Edit Resource Setup
  const handleEditResourceSetup = (resource) => {
    setSelectedResource(resource);
    setIsEditMode(true);
    setShowForm(true);

    if (resourceType === "classrooms") {
      setClassroomFormData({
        name: resource.name,
        capacity: resource.capacity,
        description: resource.description || "",
        hasProjector: resource.hasProjector,
        hasWhiteboard: resource.hasWhiteboard,
        hasComputers: resource.hasComputers,
        computerCount: resource.computerCount,
      });
    } else {
      setEquipmentFormData({
        name: resource.name,
        description: resource.description,
        lastMaintenance: resource.lastMaintenance,
        nextMaintenance: resource.nextMaintenance,
      });
    }
  };

  // Update Resource
  const handleUpdateResource = (e) => {
    e.preventDefault();
    const endpoint = resourceType === "classrooms" ? "classrooms" : "equipment";
    const data =
      resourceType === "classrooms" ? classroomFormData : equipmentFormData;

    axios
      .put(`${baseUrl}/${endpoint}/${selectedResource.id}`, data)
      .then(() => {
        if (resourceType === "classrooms") {
          const updatedClassrooms = classrooms.map((classroom) =>
            classroom.id === selectedResource.id
              ? { ...classroom, ...data }
              : classroom
          );
          setClassrooms(updatedClassrooms);
        } else {
          const updatedEquipment = equipment.map((item) =>
            item.id === selectedResource.id ? { ...item, ...data } : item
          );
          setEquipment(updatedEquipment);
        }
        resetForm();
      })
      .catch((error) => {
        console.error(`Error updating ${resourceType}:`, error);
      });
  };

  // Delete Resource
  const handleDeleteResource = (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${
        resourceType === "classrooms" ? "classroom" : "equipment item"
      }? This action cannot be undone.`
    );
    if (confirmed) {
      const endpoint =
        resourceType === "classrooms" ? "classrooms" : "equipment";
      axios
        .delete(`${baseUrl}/${endpoint}/${id}`)
        .then(() => {
          if (resourceType === "classrooms") {
            setClassrooms(
              classrooms.filter((classroom) => classroom.id !== id)
            );
          } else {
            setEquipment(equipment.filter((item) => item.id !== id));
          }
          setSelectedResource(null);
        })
        .catch((error) => {
          console.error(`Error deleting ${resourceType}:`, error);
        });
    }
  };

  // Reset Form
  const resetForm = () => {
    setShowForm(false);
    setIsEditMode(false);
    setClassroomFormData({
      name: "",
      capacity: "",
      description: "",
      hasProjector: false,
      hasWhiteboard: false,
      hasComputers: false,
      computerCount: 0,
    });
    setEquipmentFormData({
      name: "",
      description: "",
      lastMaintenance: "",
      nextMaintenance: "",
    });
  };

  // Filtered Resources
  const filteredResources =
    resourceType === "classrooms"
      ? classrooms.filter(
          (classroom) =>
            classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (classroom.description &&
              classroom.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        )
      : equipment.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description &&
              item.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        );

  if (loading) return <p className="text-center p-4">Loading data...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Resource Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col flex-grow p-4">
        {/* Resource Type Toggle */}
        <div className="flex mb-6 space-x-4">
          <button
            onClick={() => {
              setResourceType("classrooms");
              setSelectedResource(null);
              setShowForm(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              resourceType === "classrooms"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Classrooms
          </button>
          <button
            onClick={() => {
              setResourceType("equipment");
              setSelectedResource(null);
              setShowForm(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              resourceType === "equipment"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Equipment
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder={`Search ${resourceType}...`}
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Action Button */}
          {!showForm && !selectedResource && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => {
                resetForm(); // Reset first to clear form state
                setShowForm(true); // Ensure form is visible after reset
                setIsEditMode(false);
              }}
            >
              Create New{" "}
              {resourceType === "classrooms" ? "Classroom" : "Equipment"}
            </button>
          )}
        </div>

        {/* Add/Edit Resource Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode
                ? `Edit ${
                    resourceType === "classrooms" ? "Classroom" : "Equipment"
                  }`
                : `Create New ${
                    resourceType === "classrooms" ? "Classroom" : "Equipment"
                  }`}
            </h3>

            <form
              onSubmit={
                isEditMode ? handleUpdateResource : handleCreateResource
              }
              className="space-y-4"
            >
              {resourceType === "classrooms" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classroom Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={classroomFormData.name}
                      onChange={(e) => handleFormChange(e, "classroom")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      placeholder="e.g., Lab Room 101"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={classroomFormData.capacity}
                      onChange={(e) => handleFormChange(e, "classroom")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={classroomFormData.description}
                      onChange={(e) => handleFormChange(e, "classroom")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      rows="3"
                      placeholder="Brief description of the classroom"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasProjector"
                        checked={classroomFormData.hasProjector}
                        onChange={(e) => handleFormChange(e, "classroom")}
                        className="mr-2"
                      />
                      Has Projector
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasWhiteboard"
                        checked={classroomFormData.hasWhiteboard}
                        onChange={(e) => handleFormChange(e, "classroom")}
                        className="mr-2"
                      />
                      Has Whiteboard
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasComputers"
                        checked={classroomFormData.hasComputers}
                        onChange={(e) => handleFormChange(e, "classroom")}
                        className="mr-2"
                      />
                      Has Computers
                    </label>
                    {classroomFormData.hasComputers && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Computers
                        </label>
                        <input
                          type="number"
                          name="computerCount"
                          value={classroomFormData.computerCount}
                          onChange={(e) => handleFormChange(e, "classroom")}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={equipmentFormData.name}
                      onChange={(e) => handleFormChange(e, "equipment")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      placeholder="e.g., Microscope Set"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={equipmentFormData.description}
                      onChange={(e) => handleFormChange(e, "equipment")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      rows="3"
                      placeholder="Brief description of the equipment"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Maintenance
                    </label>
                    <input
                      type="date"
                      name="lastMaintenance"
                      value={equipmentFormData.lastMaintenance}
                      onChange={(e) => handleFormChange(e, "equipment")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Maintenance
                    </label>
                    <input
                      type="date"
                      name="nextMaintenance"
                      value={equipmentFormData.nextMaintenance}
                      onChange={(e) => handleFormChange(e, "equipment")}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {isEditMode ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conditional Rendering: Resource List / Resource Detail */}
        {!selectedResource && !showForm ? (
          // Resources Grid
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  No {resourceType} found matching your search.
                </p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border-2 border-blue-700 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3
                      className="text-lg font-semibold text-blue-700 cursor-pointer"
                      onClick={() => setSelectedResource(resource)}
                    >
                      {resource.name}
                    </h3>
                  </div>

                  {resourceType === "classrooms" && (
                    <>
                      <p className="text-gray-700 mt-2">
                        <span className="font-semibold">Capacity:</span>{" "}
                        {resource.capacity}
                      </p>
                      <div className="text-gray-700 mt-1">
                        {resource.hasProjector && <span>📽️ Projector | </span>}
                        {resource.hasWhiteboard && (
                          <span>📋 Whiteboard | </span>
                        )}
                        {resource.hasComputers && (
                          <span>💻 {resource.computerCount} Computers</span>
                        )}
                      </div>
                    </>
                  )}

                  {resourceType === "equipment" && (
                    <>
                      <p className="text-gray-700 mt-2">
                        <span className="font-semibold">Last Maintenance:</span>{" "}
                        {resource.lastMaintenance}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Next Maintenance:</span>{" "}
                        {resource.nextMaintenance}
                      </p>
                    </>
                  )}

                  {resource.description && (
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Manage{" "}
                      {resourceType === "classrooms"
                        ? "Classroom"
                        : "Equipment"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : selectedResource && !showForm ? (
          // Resource Detail View
          <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedResource.name}
              </h2>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {resourceType === "classrooms" ? (
                <>
                  <p>
                    <span className="font-semibold">Capacity:</span>{" "}
                    {selectedResource.capacity}
                  </p>
                  <div>
                    <span className="font-semibold">Facilities:</span>{" "}
                    {selectedResource.hasProjector && "📽️ Projector | "}
                    {selectedResource.hasWhiteboard && "📋 Whiteboard | "}
                    {selectedResource.hasComputers &&
                      `💻 ${selectedResource.computerCount} Computers`}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold">Last Maintenance:</span>{" "}
                    {selectedResource.lastMaintenance}
                  </p>
                  <p>
                    <span className="font-semibold">Next Maintenance:</span>{" "}
                    {selectedResource.nextMaintenance}
                  </p>
                </>
              )}

              {selectedResource.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-gray-700">
                    {selectedResource.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setSelectedResource(null)}
              >
                Back to{" "}
                {resourceType === "classrooms" ? "Classrooms" : "Equipment"}
              </button>
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                onClick={() => handleEditResourceSetup(selectedResource)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                onClick={() => handleDeleteResource(selectedResource.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResourceManagement;
