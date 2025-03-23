// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Subjects from "../pages/Subjects";
import Profile from "../pages/Profile";
import AssignmentSubmission from "../pages/AssignmentSubmission";
import Layout from "../layout/Layout";
import ManageUsers from "../pages/ManageUsers";
import ManageResources from "../pages/ManageResources";
import ManageBatchCourses from "../pages/ManageBatchCourses";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {" "}
          <Route path="/subjects" element={<Subjects />} />
          <Route
            path="/manage-batch-courses"
            element={<ManageBatchCourses />}
          />
          <Route path="/manage-resources" element={<ManageResources />} />
          <Route path="/manage-users" element={<ManageUsers />} />
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
