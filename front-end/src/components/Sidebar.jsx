import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null; // Don't render if user is not logged in

  // Role-based menu options
  const menu = {
    admin: [
      { name: "User Management", path: "/user-management" },
      { name: "Events", path: "/events" },
      { name: "Reports", path: "/reports" },
    ],
    lecturer: [
      { name: "Schedule Classes", path: "/scheduling" },
      { name: "Manage Assignments", path: "/assignments" },
      { name: "Messages", path: "/messages" },
    ],
    coordinator: [
      { name: "Approve Events", path: "/events" },
      { name: "Resource Management", path: "/resources" },
      { name: "Announcements", path: "/announcements" },
    ],
    student: [
      { name: "My Schedule", path: "/scheduling" },
      { name: "Join Events", path: "/events" },
      { name: "Course Materials", path: "/materials" },
    ],
  };

  return (
    <div className="w-60 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">{user.role} Dashboard</h2>
      <ul>
        {menu[user.role]?.map((item) => (
          <li key={item.path} className="mb-2">
            <Link
              to={item.path}
              className="block p-2 hover:bg-gray-700 rounded"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
