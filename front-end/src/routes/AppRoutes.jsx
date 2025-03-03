import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
// import Registration from "../pages/Registration";
// import Profile from "../pages/Profile";
// import Scheduling from "../pages/Scheduling";
// import Events from "../pages/Events";
// import Resources from "../pages/Resources";
// import UserManagement from "../pages/UserManagement";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
