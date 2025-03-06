import Sidebar from "../components/Sidebar";
import HeaderDesktop from "../components/HeaderDesktop";
import { useAuth } from "../context/AuthContext";
import Schedule from "../components/MiniSchedule";
import NavlayOut from "../layout/NavLayout";
import Announcements from "../components/Announcements";
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>; // Show loading while fetching user

  // Role-specific content
  const dashboardContent = {
    admin: "Manage users, events, and view reports.",
    lecturer: "Manage your class schedule and assignments.",
    coordinator: "Approve events and manage resources.",
    student: "View your schedule and participate in events.",
  };

  return (
    <div className="flex ">
      <div className="flex-1 p-6 rounded-2xl">
        <div className="hidden lg:block">
          <HeaderDesktop />
        </div>

        {/* Show Mini Schedule only for Students */}
        {user.role === "student" && (
          <div className="mt-6">
            <Schedule />

            <Announcements />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
