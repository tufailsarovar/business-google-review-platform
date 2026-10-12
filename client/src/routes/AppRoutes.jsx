import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import BusinessLayout from "../layouts/BusinessLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";
import PublicOnlyRoute from "../components/common/PublicOnlyRoute";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

import AdminLogin from "../pages/admin/Login";

import Dashboard from "../pages/business/Dashboard";
import Profile from "../pages/business/Profile";
import EditProfile from "../pages/business/EditProfile";
import GoogleSettings from "../pages/business/GoogleSettings";
import PublicRatingPage from "../pages/business/PublicRatingPage";
import Analytics from "../pages/business/Analytics";
import Settings from "../pages/business/Settings";
import ContactAdmin from "../pages/business/ContactAdmin";

import BusinessRating from "../pages/public/BusinessRating";

import AdminDashboard from "../pages/admin/Dashboard";
import Businesses from "../pages/admin/Businesses";
import BusinessDetails from "../pages/admin/BusinessDetails";
import Users from "../pages/admin/Users";
import RegistrationRequests from "../pages/admin/RegistrationRequests";
import ReviewTemplates from "../pages/admin/ReviewTemplates";
import AdminSettings from "../pages/admin/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC / AUTH PAGES
      ========================= */}

      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route element={<PublicOnlyRoute />}>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />
        </Route>

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/verify-email/:token"
          element={<VerifyEmail />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
      </Route>

      {/* =========================
          PUBLIC BUSINESS RATING
          NO NAVBAR / NO FOOTER
      ========================= */}

      <Route
        path="/rate/:businessId"
        element={<BusinessRating />}
      />

      {/* =========================
          BUSINESS DASHBOARD
      ========================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["business"]}
          />
        }
      >
        <Route element={<BusinessLayout />}>
          <Route
            path="/business/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/business/profile"
            element={<Profile />}
          />

          <Route
            path="/business/profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="/business/google-settings"
            element={<GoogleSettings />}
          />

          <Route
            path="/business/public-page"
            element={<PublicRatingPage />}
          />

          <Route
            path="/business/analytics"
            element={<Analytics />}
          />

          <Route
            path="/business/settings"
            element={<Settings />}
          />

          <Route
            path="/business/contact-admin"
            element={<ContactAdmin />}
          />
        </Route>
      </Route>

      {/* =========================
          ADMIN DASHBOARD
      ========================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          />
        }
      >
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/registration-requests"
            element={<RegistrationRequests />}
          />

          <Route
            path="/admin/businesses"
            element={<Businesses />}
          />

          <Route
            path="/admin/businesses/:id"
            element={<BusinessDetails />}
          />

        

          <Route
            path="/admin/users"
            element={<Users />}
          />

          <Route
            path="/admin/review-templates"
            element={<ReviewTemplates />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />
        </Route>
      </Route>

      {/* =========================
          FALLBACK
      ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}