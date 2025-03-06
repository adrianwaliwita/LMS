// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/Courses";
import Profile from "../pages/Profile";
import AssignmentSubmission from "../pages/AssignmentSubmission";
import Layout from "../layout/Layout"; // Import the Layout component
import NavlayOut from "../layout/NavLayout";
/*************  ✨ Codeium Command ⭐  *************/
/**
/******  75614297-2802-447f-a8c7-c92efeb1768e  *******/ const AppRoutes =
  () => {
    return (
      <Router>
        <Routes>
          <Route element={<Layout />}>
            {" "}
            {/* Layout is wrapping all routes */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/assignment" element={<AssignmentSubmission />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    );
  };

export default AppRoutes;
