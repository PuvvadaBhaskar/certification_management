import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AddCertification from "./pages/AddCertification";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminCertificateManagement from "./pages/AdminCertificateManagement";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSystemConfig from "./pages/AdminSystemConfig";
import AdminAnalytics from "./pages/AdminAnalytics";
import ManageCertifications from "./pages/ManageCertifications";
import Profile from "./pages/Profile";
import MyCertifications from "./pages/MyCertifications";
import RenewCertification from "./pages/RenewCertification";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

       <Route path="/" element={<LandingPage />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

<Route
  path="/renew/:id"
  element={
    <ProtectedRoute allowedRole="user">
      <RenewCertification />
    </ProtectedRoute>
  }
/>
<Route
  path="/user/certifications"
  element={
    <ProtectedRoute allowedRole="user">
      <MyCertifications />
    </ProtectedRoute>
  }
/>
<Route
  path="/user/dashboard"
  element={
    <ProtectedRoute allowedRole="user">
      <UserDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute allowedRole="user">
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
  path="/add-certification"
  element={
    <ProtectedRoute allowedRole="user">
      <AddCertification />
    </ProtectedRoute>
  }
/>

<Route
  path="/notifications"
  element={
    <ProtectedRoute allowedRole="user">
      <Notifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminUserManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/certifications"
  element={
    <ProtectedRoute allowedRole="admin">
      <ManageCertifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/certificate-management"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminCertificateManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/notifications"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminNotifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/system-config"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminSystemConfig />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/analytics"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminAnalytics />
    </ProtectedRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;