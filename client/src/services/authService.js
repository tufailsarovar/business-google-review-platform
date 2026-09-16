import api from "./api";

export const signup = data =>
  api.post("/auth/signup", data);

export const login = data =>
  api.post("/auth/login", data);

export const adminLogin = data =>
  api.post("/auth/admin-login", data);

export const forgotPassword = data =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const verifyEmail = token =>
  api.get(`/auth/verify-email/${token}`);

export const me = () =>
  api.get("/auth/me");

export default {
  signup,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  me,
};