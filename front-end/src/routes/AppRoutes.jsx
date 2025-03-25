// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Subjects from "../pages/Subjects";
import Profile from "../pages/Profile";
import AssignmentSubmission from "../pages/student/AssignmentSubmission";
import Layout from "../layout/Layout";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageResources from "../pages/admin/ManageResources";
import ManageBatches from "../pages/admin/ManageBatches";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageLectures from "../pages/admin/ManageLectures";
import ManageSubjects from "../pages/admin/ManageSubjects";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {" "}
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/manage-batches" element={<ManageBatches />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/manage-resources" element={<ManageResources />} />
          <Route path="/manage-Lectures" element={<ManageLectures />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/manage-subjects" element={<ManageSubjects />} />
          <Route path="/assignment" element={<AssignmentSubmission />} />
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
