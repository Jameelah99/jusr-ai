
import { Navigate, Outlet } from "react-router-dom";

import { useUser } from "../../context/UserContext";
import {
  hasPermission,
  type AppPermission,
} from "../../context/permissions";

interface ProtectedRouteProps {
  permission: AppPermission;
}

function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { activeUser } = useUser();

  const isAuthorised = hasPermission(
    activeUser.role,
    permission
  );

  if (!isAuthorised) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
