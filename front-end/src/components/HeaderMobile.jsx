import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Mobile menu items based on user role
  const mobileMenuItems = {
    1: [
      // Admin
      { name: "Home", path: "/dashboard" },
      { name: "Manage Users", path: "/manage-users" },
      { name: "Manage Batches", path: "/manage-batches" },
      { name: "Manage Courses", path: "/manage-courses" },
      { name: "Manage Resources", path: "/manage-resources" },
      { name: "Manage Modules", path: "/manage-modules" },
      { name: "Profile Settings", path: `/profile` },
    ],
    2: [
      // Coordinator
      { name: "Dashboard", path: "/dashboard" },
      { name: "Manage Modules", path: "/manage-modules" },
      { name: "Profile", path: "/profile" },
    ],
    3: [
      // Lecturer
      { name: "Dashboard", path: "/dashboard" },
      { name: "Schedule Classes", path: "/scheduling" },
      { name: "Profile", path: "/profile" },
    ],
    4: [
      // Student
      { name: "Dashboard", path: "/dashboard" },
      { name: "My Modules", path: "/modules" },
      { name: "Profile", path: "/profile" },
    ],
  };

  // Close menu immediately when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest("button[aria-label]")
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    // Use click instead of mousedown for immediate response
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Header Bar */}
      <div className="bg-white text-blue-700 p-4 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center">
          {/* Hamburger Menu Button (Mobile only) */}
          <button
            className="md:hidden mr-4 focus:outline-none transition-transform duration-300 ease-in-out"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative w-6 h-6">
              <FaBars
                className={`text-xl absolute transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-0 rotate-90"
                    : "opacity-100 rotate-0"
                }`}
              />
              <FaTimes
                className={`text-xl absolute transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-100 rotate-0"
                    : "opacity-0 -rotate-90"
                }`}
              />
            </div>
          </button>

          <h1 className="text-lg font-bold">Smart Campus System</h1>
        </div>

        {user && (
          <p className="hidden md:block">
            Welcome, {user.name} ({user.role})
          </p>
        )}
      </div>

      {/* Mobile Menu - Immediate transition */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-[60px] left-0 w-3/4 max-w-xs bg-gradient-to-br from-[#0008BF] to-[#164beb] text-white shadow-lg h-screen z-50 transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="">
          {user &&
            mobileMenuItems[user.role]?.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className="block py-3 px-4 border-t border-blue-700 hover:bg-blue-800 transition-colors duration-150"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
        </div>
      </div>

      {/* Very light overlay that closes menu immediately when clicked */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#00000040] z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
