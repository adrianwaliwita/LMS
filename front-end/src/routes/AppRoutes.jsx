import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MyModules from "../pages/student/MyModules";
import Profile from "../pages/Profile";
import SubmitAssignments from "../pages/student/SubmitAssignments";
import Layout from "../layout/Layout";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageResources from "../pages/admin/ManageResources";
import ManageBatches from "../pages/admin/ManageBatches";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageModules from "../pages/admin/ManageModules";
import ScheduleLectures from "../pages/coordinator/ScheduleLectures";
import ManageAssignments from "../pages/coordinator/ManageAssignments";
import ManageStudents from "../pages/coordinator/ManageStudents";
import ManageAnnouncements from "../pages/coordinator/ManageAnnouncements";
import Manageclasses from "../pages/lecturer/ManageClasses";
import NotAuthorized from "../pages/NotAuthorized";

const ROLE_MAPPING = {
  admin: 1,
  coordinator: 2,
  lecturer: 3,
  student: 4,
};

// Role-based route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <NotAuthorized />;
  }

  const userRoleValue = user.role; // Directly use the numeric role from user object
  const isAllowed = allowedRoles.includes(userRoleValue);

  if (!isAllowed) {
    return <NotAuthorized />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          {/* Dashboard - accessible to all authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/modules"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.student]}>
                <MyModules />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignment"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.student]}>
                <SubmitAssignments />
              </ProtectedRoute>
            }
          />

          {/* Lecturer routes */}
          <Route
            path="/manage-classes"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.lecturer]}>
                <Manageclasses />
              </ProtectedRoute>
            }
          />

          {/* Coordinator routes */}
          <Route
            path="/manage-assignments"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.coordinator]}>
                <ManageAssignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule-lectures"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.coordinator]}>
                <ScheduleLectures />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-students"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.coordinator]}>
                <ManageStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-announcements"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.coordinator]}>
                <ManageAnnouncements />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/manage-batches"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.admin]}>
                <ManageBatches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-courses"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.admin]}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-resources"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.admin]}>
                <ManageResources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.admin]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-modules"
            element={
              <ProtectedRoute allowedRoles={[ROLE_MAPPING.admin]}>
                <ManageModules />
              </ProtectedRoute>
            }
          />

          {/* Common routes for all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/not-authorized" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
