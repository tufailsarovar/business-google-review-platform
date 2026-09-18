export const APP_NAME = "TapReview";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const STAR_LABELS = {
  1: "Needs improvement",
  2: "Below expectations",
  3: "Average experience",
  4: "Good experience",
  5: "Excellent experience",
};

export const STAR_VALUES = [1, 2, 3, 4, 5];

export const USER_ROLES = {
  BUSINESS: "business",
  ADMIN: "admin",
};

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",

  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",

  BUSINESS_DASHBOARD: "/business/dashboard",
  BUSINESS_PROFILE: "/business/profile",
  BUSINESS_EDIT_PROFILE: "/business/profile/edit",
  BUSINESS_GOOGLE: "/business/google-settings",
  BUSINESS_PUBLIC: "/business/public-page",
  BUSINESS_QR: "/business/qr-code",
  BUSINESS_ANALYTICS: "/business/analytics",
  BUSINESS_SETTINGS: "/business/settings",
  BUSINESS_CONTACT: "/business/contact-admin",

  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_BUSINESSES: "/admin/businesses",
  ADMIN_USERS: "/admin/users",
  ADMIN_REVIEW_TEMPLATES: "/admin/review-templates",
  ADMIN_SETTINGS: "/admin/settings",
};

export const PUBLIC_BUSINESS_ROUTE = (businessId) =>
  `/rate/${encodeURIComponent(businessId || "")}`;

export const STORAGE_KEYS = {
  TOKEN: "TapReview_token",
};

export const PASSWORD_MIN_LENGTH = 8;

export const OTP_LENGTH = 6;