import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// import {Header, Sidebar} from "../components/Header";
import { useAuth } from "../context/AuthContext";

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
      <Sidebar></Sidebar>

      <div className="flex-1 p-6 rounded-2xl">
        <Header />
        <h2 className="text-xl font-bold mt-4">Welcome to your Dashboard</h2>
        <p className="text-gray-700">{dashboardContent[user.role]}</p>
      </div>
    </div>
  );
};

export default Dashboard;
