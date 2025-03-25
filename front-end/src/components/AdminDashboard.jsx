import React from "react";
import Announcements from "./Announcements";
import axios from "axios";
import { useState, useEffect } from "react";

const baseUrl = import.meta.env.VITE_BASE_URL;

const ManageUsers = () => {
  // Mock data for users
  const [users, setUsers] = useState([]); // State to store fetched users
  const [loading, setLoading] = useState(true); // State to handle loading

  useEffect(() => {
    // Fetching the users from the API
    axios
      .get(`${baseUrl}/users`)
      .then((response) => {
        setUsers(response.data); // Store fetched users in state
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false); // Stop loading in case of error
      });
  }, []); // Fetch data when component mounts

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
      <div className="">
        <Announcements />
      </div>
    </>
  );
};

export default ManageUsers;
