import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import Loader from "./Loader";

export default function ProtectedRoute({
  role,
  allowedRoles,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Loader
        minHeight="60vh"
        message="Loading your account..."
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : role
      ? [role]
      : [];

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return user.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/business/dashboard" replace />
    );
  }

  return <Outlet />;
}