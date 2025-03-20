import React from "react";
import Announcements from "./Announcements";

const ManageUsers = () => {
  // Mock data for users
  const users = [
    { id: 1, name: "John Doe", role: "admin", status: "active" },
    { id: 2, name: "Jane Smith", role: "coordinator", status: "active" },
    { id: 3, name: "Bob Johnson", role: "professor", status: "inactive" },
    { id: 4, name: "Alice Williams", role: "student", status: "active" },
    { id: 5, name: "Michael Brown", role: "student", status: "active" },
    { id: 6, name: "Sarah Davis", role: "student", status: "inactive" },
    { id: 7, name: "David Wilson", role: "professor", status: "active" },
    { id: 8, name: "Emily Taylor", role: "coordinator", status: "active" },
    { id: 9, name: "James Miller", role: "student", status: "active" },
    { id: 10, name: "Jennifer Anderson", role: "professor", status: "active" },
  ];

  return (
    <>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow text-black">
          <h3 className="font-bold mb-2">User Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-medium">
                {users.filter((u) => u.status === "active").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Inactive Users:</span>
              <span className="font-medium">
                {users.filter((u) => u.status === "inactive").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-700 p-4 rounded-lg shadow text-black">
          <h3 className="font-bold mb-2">Role Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Admins:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "admin").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Coordinators:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "coordinator").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Professors:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "professor").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Students:</span>
              <span className="font-medium">
                {users.filter((u) => u.role === "student").length}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Announcements />
      </div>
    </>
  );
};

export default ManageUsers;
