import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const storedRole = localStorage.getItem("role") || "";
  const role = storedRole.toUpperCase().replace("ROLE_", "");

  // Not logged in
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (role !== allowedRole) {
    return <Navigate to={role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  // Allowed
  return children;
}

export default ProtectedRoute;