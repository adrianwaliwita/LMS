import Sidebar from "../components/Sidebar";
import HeaderDesktop from "../components/HeaderDesktop";
import { useAuth } from "../context/AuthContext";
import Schedule from "../components/MiniSchedule";
import NavlayOut from "../layout/NavLayout";
import Announcements from "../components/Announcements";
import AdminDashboard from "../components/AdminDashboard";
import StudentDashboard from "../components/StudentDashboard";
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>; // Show loading while fetching user

  // Assuming users is available in the component or could be fetched
  const users =
    user.role === "admin"
      ? [
          // Sample data for demonstration
          { id: 1, name: "John Doe", role: "admin", status: "active" },
          { id: 2, name: "Jane Smith", role: "coordinator", status: "active" },
          { id: 3, name: "Bob Johnson", role: "professor", status: "inactive" },
          { id: 4, name: "Alice Williams", role: "student", status: "active" },
          // Add more sample users as needed
        ]
      : [];

  // Filter users based on selected criteria
  const filteredUsers = users;

  return (
    <div className="flex">
      <div className="flex-1 p-6 rounded-2xl">
        <div className="hidden lg:block">
          <HeaderDesktop />
        </div>

        {/* Admin-only dashboard */}
        {user.role === "admin" && <AdminDashboard />}

        {/* Show Mini Schedule only for Students */}
        {user.role === "student" && <StudentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
