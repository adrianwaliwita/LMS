// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Modules from "../pages/student/Modules";
import Profile from "../pages/Profile";
import AssignmentSubmission from "../pages/student/AssignmentSubmission";
import Layout from "../layout/Layout";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageResources from "../pages/admin/ManageResources";
import ManageBatches from "../pages/admin/ManageBatches";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageModules from "../pages/admin/ManageModules";

import ManageStudents from "../pages/coordinator/ManageStudents";
import ManageAnnouncements from "../pages/coordinator/ManageAnnouncements";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/modules" element={<Modules />} />
          <Route path="/manage-batches" element={<ManageBatches />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/manage-resources" element={<ManageResources />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/manage-modules" element={<ManageModules />} />
          <Route path="/assignment" element={<AssignmentSubmission />} />

          <Route path="/manage-students" element={<ManageStudents />} />
          <Route
            path="/manage-announcements"
            element={<ManageAnnouncements />}
          />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
