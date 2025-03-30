import Sidebar from "../components/Sidebar";
import HeaderDesktop from "../components/HeaderDesktop";
import { useAuth } from "../context/AuthContext";
import Schedule from "../components/MiniSchedule";
import NavlayOut from "../layout/NavLayout";
import Announcements from "../components/Announcements";
import AdminDashboard from "./admin/AdminDashboard";
import StudentDashboard from "./student/StudentDashboard";
import CoordDashboard from "./coordinator/CoordDashboard";
import LecDashboard from "./lecturer/LecDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>; // Show loading while fetching user
  return (
    <div className="flex">
      <div className="flex-1 p-6 rounded-2xl">
        <div className="hidden lg:block">
          <HeaderDesktop />
        </div>

        {user.role === 1 && <AdminDashboard />}
        {user.role === 2 && <CoordDashboard />}
        {user.role === 3 && <LecDashboard />}
        {user.role === 4 && <StudentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
