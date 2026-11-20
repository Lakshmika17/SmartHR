
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("smarthr_token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("smarthr_user") || "null"
    );
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "HR_ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
