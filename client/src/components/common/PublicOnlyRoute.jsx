import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import Loader from "./Loader";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Loader
        minHeight="60vh"
        message="Loading your account..."
      />
    );
  }

  if (user) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin/dashboard"
            : "/business/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}