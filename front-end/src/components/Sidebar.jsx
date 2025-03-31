import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import Logo from "/SMSC.png";
import { useNavigate } from "react-router-dom"; // For navigation

const UserRoles = {
  0: "Terminated",
  1: "Admin",
  2: "Coordinator",
  3: "Lecturer",
  4: "Student",
};
const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Get navigate function from useNavigate hook

  if (!user) return null;

  const menu = {
    1: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Users", path: "/manage-users" }, //done
      //leturer modules has to be assigned to the lecturers

      { name: "Manage Batches", path: "/manage-batches" }, //done
      { name: "Manage Courses", path: "/manage-courses" }, //admin can make and manage Courses

      { name: "Manage Resources", path: "/manage-resources" }, //can create resources and classrooms
      { name: "Manage Modules", path: "/manage-modules" }, //can create resources and classrooms

      { name: "Profile Settings", path: `/profile` },
    ],

    2: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Students", path: "/manage-students" }, //done
      { name: "Manage Assignments", path: "/manage-assignments" }, //show users who submitted the assignment
      {
        name: "Schedule Lectures",
        path: "/schedule-lectures",
      }, //can manage resources, equipment and classrooms necessary for the lecturers (1st step select the module, 2nd step has to select batch, date and time slot, 3rd send request to api and populate content. )
      { name: "Manage Announcements", path: "/manage-announcements" },

      { name: "Profile Settings", path: `/profile` },
    ],

    3: [
      { name: "Home", path: "/dashboard" },
      { name: "My Classes", path: "/manage-classes" }, //linked to modules from students all documents are uploaded from the coordinator
      { name: "Profile Settings", path: `/profile` },
    ],

    4: [
      { name: "Home", path: "/dashboard" },
      { name: "My Modules", path: "/modules" }, //show schedules of the student
      { name: "Submit Assignments", path: "/assignment" },
      { name: "Profile Settings", path: `/profile` },
    ],
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Fixed, doesn't move with scroll */}
      <div
        className={`w-60 h-screen bg-gradient-to-br from-[#0008BF] to-[#164beb] shadow-[10px_0_20px_-5px_rgba(0,0,0,0.2)] text-white p-4 fixed top-0 left-0 z-20 transition-all duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          ${isOpen ? "opacity-100" : "opacity-0 md:opacity-100"}`}
      >
        {isOpen && (
          <button
            className="absolute top-4 right-4 text-white text-3xl md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <FaArrowLeft />
          </button>
        )}

        <h2 className="text-2xl capitalize font-bold mb-4 p-[0.5vw]">
          {UserRoles[user.role]} Dashboard
        </h2>
        <ul className="mb-auto">
          {menu[user.role]?.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className="block p-2 hover:bg-gray-700 rounded transition duration-200"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li className="mb-2 ">
            <button
              onClick={handleLogout}
              className="block p-2 hover:bg-red-700 hover:text-white text-red-600 rounded transition duration-200"
            >
              Logout
            </button>
          </li>
        </ul>
        <div className="flex justify-center mt-auto pt-8">
          <img src={Logo} alt="Logo" className="w-30 h-30" />
        </div>
      </div>

      {/* Main content area - with right navbar */}
      <div className="flex-1 ml-0 md:ml-60"> </div>
    </div>
  );
};

export default Sidebar;
