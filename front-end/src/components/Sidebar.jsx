import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import Logo from "/SMSC.png";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  if (!user) return null;

  const menu = {
    admin: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Users", path: "/manage-users" },

      { name: "Manage Batch/Courses", path: "/manage-batch-courses" },
      { name: "Chat", path: "/Chat" },
    ],
    lecturer: [
      { name: "Home", path: "/dashboard" },
      { name: "Schedule Classes", path: "/scheduling" },
      { name: "Manage Assignments", path: "/assignment" },
      { name: "Messages", path: "/messages" },
      { name: "Chat", path: "/Chat" },
    ],
    coordinator: [
      { name: "Home", path: "/dashboard" },
      { name: "Manage Subjects", path: "/manage-subjects" },
      { name: "Manage Resources", path: "/manage-resources" },

      { name: "Announcements", path: "/announcements" },
      { name: "Chat", path: "/Chat" },
    ],
    student: [
      { name: "Home", path: "/dashboard" },
      { name: "My Subjects", path: "/subjects" },
      { name: "Assignments", path: "/assignment" },
      { name: "Profile Settings", path: "/profile" },
      { name: "Chat", path: "/Chat" },
    ],
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
