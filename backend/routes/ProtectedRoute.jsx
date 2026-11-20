
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem("smarthr_token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("smarthr_user"));
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "HR_ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "HR_STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
