import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../api/apiClient";

const ResourceManagement = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceType, setResourceType] = useState("classrooms");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [classroomFormData, setClassroomFormData] = useState({
    name: "",
    capacity: 1,
  });

  const [equipmentFormData, setEquipmentFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classroomsRes, equipmentRes] = await Promise.all([
          apiClient.get("/classrooms"),
          apiClient.get("/equipment"),
        ]);

        setClassrooms(classroomsRes.data);
        setEquipment(equipmentRes.data);
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

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "classroom") {
      setClassroomFormData((prev) => ({
        ...prev,
        [name]: name === "capacity" ? parseInt(value) || 0 : value,
      }));
    } else {
      setEquipmentFormData((prev) => ({
        ...prev,
        [name]: name === "quantity" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        resourceType === "classrooms" ? "/classrooms" : "/equipment";
      const data =
        resourceType === "classrooms" ? classroomFormData : equipmentFormData;

      const response = await apiClient.post(endpoint, data);

      if (resourceType === "classrooms") {
        setClassrooms([...classrooms, response.data]);
      } else {
        setEquipment([...equipment, response.data]);
      }

      resetForm();
      toast.success(
        `${
          resourceType === "classrooms" ? "Classroom" : "Equipment"
        } created successfully`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to create ${
          resourceType === "classrooms" ? "classroom" : "equipment"
        }`;
      toast.error(errorMessage);
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        resourceType === "classrooms"
          ? `/classrooms/${selectedResource.id}`
          : `/equipment/${selectedResource.id}`;

      const data =
        resourceType === "classrooms" ? classroomFormData : equipmentFormData;

      const response = await apiClient.patch(endpoint, data);

      if (resourceType === "classrooms") {
        setClassrooms(
          classrooms.map((c) =>
            c.id === selectedResource.id ? response.data : c
          )
        );
      } else {
        setEquipment(
          equipment.map((e) =>
            e.id === selectedResource.id ? response.data : e
          )
        );
      }

      resetForm();
      setSelectedResource(null);
      toast.success(
        `${
          resourceType === "classrooms" ? "Classroom" : "Equipment"
        } updated successfully`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to update ${
          resourceType === "classrooms" ? "classroom" : "equipment"
        }`;
      toast.error(errorMessage);
    }
  };

  const handleDeleteResource = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${
          resourceType === "classrooms" ? "classroom" : "equipment"
        }?`
      )
    )
      return;
    try {
      const endpoint =
        resourceType === "classrooms"
          ? `/classrooms/${id}`
          : `/equipment/${id}`;

      await apiClient.delete(endpoint);

      if (resourceType === "classrooms") {
        setClassrooms(classrooms.filter((c) => c.id !== id));
      } else {
        setEquipment(equipment.filter((e) => e.id !== id));
      }

      if (selectedResource?.id === id) setSelectedResource(null);
      toast.success(
        `${
          resourceType === "classrooms" ? "Classroom" : "Equipment"
        } deleted successfully`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to delete ${
          resourceType === "classrooms" ? "classroom" : "equipment"
        }`;
      toast.error(errorMessage);
    }
  };

  const handleEditSetup = (resource) => {
    if (resourceType === "classrooms") {
      setClassroomFormData({
        name: resource.name,
        capacity: resource.capacity,
      });
    } else {
      setEquipmentFormData({
        name: resource.name,
        description: resource.description,
        quantity: resource.quantity,
      });
    }
    setSelectedResource(resource);
    setIsEditMode(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setClassroomFormData({
      name: "",
      capacity: 1,
    });
    setEquipmentFormData({
      name: "",
      description: "",
      quantity: 0,
    });
    setIsEditMode(false);
    setShowForm(false);
  };

  const filteredResources = (
    resourceType === "classrooms" ? classrooms : equipment
  ).filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description &&
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (user?.role !== 1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading data...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={5000} />

      <header className="bg-blue-700 text-white p-4 shadow rounded-xl">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Resource Management</h1>
        </div>
      </header>

      <div className="container mx-auto flex flex-col flex-grow p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <input
            type="text"
            placeholder={`Search ${resourceType}...`}
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {!showForm && !selectedResource && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => {
                resetForm();
                setShowForm(true);
                setIsEditMode(false);
              }}
            >
              + Add New{" "}
              {resourceType === "classrooms" ? "Classroom" : "Equipment"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-700">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEditMode
                ? `Edit ${
                    resourceType === "classrooms" ? "Classroom" : "Equipment"
                  }`
                : `Add New ${
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
                      onChange={(e) => handleInputChange(e, "classroom")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      required
                      placeholder="e.g., Computer Lab A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={classroomFormData.capacity}
                      onChange={(e) => handleInputChange(e, "classroom")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      required
                    />
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
                      onChange={(e) => handleInputChange(e, "equipment")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      required
                      placeholder="e.g., Projector"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={equipmentFormData.description}
                      onChange={(e) => handleInputChange(e, "equipment")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      rows="3"
                      placeholder="Equipment description"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={equipmentFormData.quantity}
                      onChange={(e) => handleInputChange(e, "equipment")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                      required
                    />
                  </div>
                </>
              )}

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
                  {isEditMode ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!selectedResource && !showForm ? (
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
                  <h3
                    className="text-lg font-semibold text-blue-700 cursor-pointer"
                    onClick={() => setSelectedResource(resource)}
                  >
                    {resource.name}
                  </h3>
                  {resourceType === "classrooms" ? (
                    <p className="text-gray-700 mt-2">
                      <span className="font-semibold">Capacity:</span>{" "}
                      {resource.capacity}
                    </p>
                  ) : (
                    <>
                      <p className="text-gray-700 mt-2">
                        <span className="font-semibold">Quantity:</span>{" "}
                        {resource.quantity}
                      </p>
                      {resource.description && (
                        <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </>
                  )}
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedResource(resource)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : selectedResource && !showForm ? (
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
                  <p>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(selectedResource.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {new Date(selectedResource.updatedAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {selectedResource.quantity}
                  </p>
                  {selectedResource.description && (
                    <p>
                      <span className="font-semibold">Description:</span>{" "}
                      {selectedResource.description}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(selectedResource.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {new Date(selectedResource.updatedAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back to{" "}
                {resourceType === "classrooms" ? "Classrooms" : "Equipment"}
              </button>
              <button
                onClick={() => handleEditSetup(selectedResource)}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteResource(selectedResource.id)}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
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
