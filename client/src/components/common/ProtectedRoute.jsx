import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ role, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("TapReview_token");

  if (!user && loading && !token) {
    return null;
  }

  if (!user && loading && token) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : role ? [role] : [];

  if (roles.length && !roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/business/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}
