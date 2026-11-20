
import ProtectedRoute from "./ProtectedRoute";

const StaffRoute = () => {
  return <ProtectedRoute allowedRoles={["HR_STAFF"]} />;
};

export default StaffRoute;
