
import { Navigate, Outlet } from "react-router-dom";

import {
  getAuthToken,
  getCurrentUser,
} from "../services/authService";

export default function StaffRoute() {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "HR_STAFF") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
