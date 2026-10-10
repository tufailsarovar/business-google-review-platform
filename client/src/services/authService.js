import api from "./api";

export const signup = (data) => api.post("/auth/signup", data);

export const login = (data) => api.post("/auth/login", data);

export const adminLogin = (data) => api.post("/auth/admin-login", data);

// Business email OTP
export const sendEmailOtp = (data) => api.post("/auth/send-email-otp", data);

export const verifyEmailOtp = (data) =>
  api.post("/auth/verify-email-otp", data);

export const completeBusinessRegistration = (data) =>
  api.post("/auth/complete-registration", data);

export const googleLogin = (data) => api.post("/auth/google", data);

// Super Admin authentication
export const sendSuperAdminEmailOtp = (data) =>
  api.post("/auth/super-admin/send-email-otp", data);

export const verifySuperAdminEmailOtp = (data) =>
  api.post("/auth/super-admin/verify-email-otp", data);

export const superAdminGoogleLogin = (data) =>
  api.post("/auth/super-admin/google", data);

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);

export const me = () => api.get("/auth/me");

export default {
  signup,
  login,
  adminLogin,
  sendEmailOtp,
  verifyEmailOtp,
  completeBusinessRegistration,
  googleLogin,
  sendSuperAdminEmailOtp,
  verifySuperAdminEmailOtp,
  superAdminGoogleLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  me,
};
