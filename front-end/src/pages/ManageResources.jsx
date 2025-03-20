import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import HeaderDesktop from "../components/HeaderDesktop";

const ResourceManagement = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "classroom",
    availability: true,
    location: "",
    capacity: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setResources([
        {
          id: 1,
          name: "Lecture Hall A",
          type: "classroom",
          availability: true,
          location: "Main Building, Floor 2",
          capacity: 120,
          notes: "Projector and sound system available",
        },
        {
          id: 2,
          name: "Conference Room B",
          type: "meeting",
          availability: true,
          location: "Admin Building, Floor 1",
          capacity: 20,
          notes: "Video conferencing equipment",
        },
        {
          id: 3,
          name: "Science Lab C",
          type: "lab",
          availability: false,
          location: "Science Building, Floor 3",
          capacity: 30,
          notes: "Under maintenance until next week",
        },
        {
          id: 4,
          name: "Projector XD-400",
          type: "equipment",
          availability: true,
          location: "IT Department",
          capacity: null,
          notes: "4K resolution, reserve at least 2 days in advance",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewResource({
      ...newResource,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    const resource = {
      ...newResource,
      id: Date.now(),
    };
    setResources([...resources, resource]);
    setNewResource({
      name: "",
      type: "classroom",
      availability: true,
      location: "",
      capacity: "",
      notes: "",
    });
  };

  const handleEditResource = (id) => {
    const resourceToEdit = resources.find((resource) => resource.id === id);
    setNewResource(resourceToEdit);
    setEditingId(id);
  };

  const handleUpdateResource = (e) => {
    e.preventDefault();
    const updatedResources = resources.map((resource) =>
      resource.id === editingId ? newResource : resource
    );
    setResources(updatedResources);
    setNewResource({
      name: "",
      type: "classroom",
      availability: true,
      location: "",
      capacity: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleDeleteResource = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );
    if (confirmed) {
      setResources(resources.filter((resource) => resource.id !== id));
    }
  };

  const handleToggleAvailability = (id) => {
    const updatedResources = resources.map((resource) =>
      resource.id === id
        ? { ...resource, availability: !resource.availability }
        : resource
    );
    setResources(updatedResources);
  };

  const filteredResources =
    filterType === "all"
      ? resources
      : resources.filter((resource) => resource.type === filterType);

  if (loading) return <p>Loading resources...</p>;

  return (
    <div className="flex">
      <div className="flex-1 p-6 rounded-2xl">
        <div className="hidden lg:block">
          <HeaderDesktop />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-6 text-black">
            Resource Management
          </h2>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg ${
                filterType === "all"
                  ? "bg-blue-700 text-white"
                  : "border-2 border-blue-700 text-blue-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("classroom")}
              className={`px-4 py-2 rounded-lg ${
                filterType === "classroom"
                  ? "bg-blue-700 text-white"
                  : "border-2 border-blue-700 text-blue-700"
              }`}
            >
              Classrooms
            </button>
            <button
              onClick={() => setFilterType("meeting")}
              className={`px-4 py-2 rounded-lg ${
                filterType === "meeting"
                  ? "bg-blue-700 text-white"
                  : "border-2 border-blue-700 text-blue-700"
              }`}
            >
              Meeting Rooms
            </button>
            <button
              onClick={() => setFilterType("lab")}
              className={`px-4 py-2 rounded-lg ${
                filterType === "lab"
                  ? "bg-blue-700 text-white"
                  : "border-2 border-blue-700 text-blue-700"
              }`}
            >
              Labs
            </button>
          </div>

          {/* Resource List */}
          <div className="bg-white border-2 border-blue-700 w-full p-4 rounded-lg shadow text-black mb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Available Resources
            </h3>
            <div className="space-y-3">
              {filteredResources.length === 0 ? (
                <p className="text-gray-500">No resources found.</p>
              ) : (
                filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <strong className="text-blue-700">
                          {resource.name}
                        </strong>
                        <span className="ml-2 capitalize text-gray-700">
                          ({resource.type})
                        </span>
                      </div>

                      <div className="mt-1 sm:mt-0">
                        <span className="font-semibold">
                          {resource.location}
                        </span>
                        {resource.capacity && (
                          <span className="ml-2 text-gray-700">
                            (Capacity: {resource.capacity})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          resource.availability
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {resource.availability ? "Available" : "Unavailable"}
                      </span>

                      <div>
                        <button
                          onClick={() => handleToggleAvailability(resource.id)}
                          className="text-sm text-blue-700 hover:text-blue-900 mr-4"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleEditResource(resource.id)}
                          className="text-sm text-blue-700 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="text-sm text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {resource.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Notes:</strong> {resource.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add/Edit Resource Form */}
          <div className="bg-white border-2 border-blue-700 w-full p-4 rounded-lg shadow text-black">
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {editingId ? "Edit Resource" : "Add New Resource"}
            </h3>
            <form
              onSubmit={editingId ? handleUpdateResource : handleAddResource}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newResource.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Type
                  </label>
                  <select
                    name="type"
                    value={newResource.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="meeting">Meeting Room</option>
                    <option value="lab">Laboratory</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={newResource.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (if applicable)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={newResource.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={newResource.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="availability"
                      checked={newResource.availability}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-700 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Available for booking
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  {editingId ? "Update Resource" : "Add Resource"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setNewResource({
                        name: "",
                        type: "classroom",
                        availability: true,
                        location: "",
                        capacity: "",
                        notes: "",
                      });
                    }}
                    className="ml-4 border-2 border-blue-700 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;
