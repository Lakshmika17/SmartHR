
import ProtectedRoute from "./ProtectedRoute";

const AdminRoute = () => {
  return <ProtectedRoute allowedRoles={["HR_ADMIN"]} />;
};

export default AdminRoute;
