
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ role, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Render immediately if a saved authenticated user is available.
  if (loading && !user) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : role
      ? [role]
      : [];

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/business/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}
