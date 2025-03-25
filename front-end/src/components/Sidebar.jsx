import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import Logo from "/SMSC.png";
import { useNavigate } from "react-router-dom"; // For navigation

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Get navigate function from useNavigate hook

  if (!user) return null;

  const menu = {
    admin: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Users", path: "/manage-users" }, //during student creation student can be assigned to a batch
      //leturer subjects has to be assigned to the lecturers

      { name: "Manage Batches", path: "/manage-batches" }, //admin can make and manage batches
      { name: "Manage Courses", path: "/manage-courses" }, //admin can make and manage Courses

      { name: "Manage Resources", path: "/manage-resources" }, //can create resources and classrooms
      { name: "Manage Subjects", path: "/manage-subjects" }, //can create resources and classrooms
      { name: "Profile Settings", path: "/profile" },

      { name: "Profile Settings", path: "/profile" },
    ],

    lecturer: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage & Schedule Classes", path: "/scheduling" }, //linked to subjects from students all documents are uploaded from the coordinator
      { name: "Profile Settings", path: "/profile" },
    ],

    coordinator: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Subjects", path: "/manage-subjects" },
      { name: "Manage Students", path: "/manage-users" }, //during student creation student can be assigned to a batch
      { name: "Manage Assignments", path: "/assignment" }, //show users who submitted the assignment
      { name: "Manage Lecture Scheduling & Resources", path: "/assignment" }, //can manage resources, equipment and classrooms necessary for the lecturers (1st step select the subject, 2nd step has to select batch, date and time slot, 3rd send request to api and populate content. )
      { name: "Announcements", path: "/announcements" },

      { name: "Profile Settings", path: "/profile" },
    ],

    student: [
      { name: "Home", path: "/dashboard" },
      { name: "My Subjects", path: "/subjects" }, //show schedules of the student
      { name: "Submit Assignments", path: "/assignment" },

      { name: "Profile Settings", path: "/profile" },
    ],
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Overlay darkening background - only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0000003f] z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

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
          {user.role} Dashboard
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
