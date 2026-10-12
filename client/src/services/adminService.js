import api from "./api";

export const getDashboardStats = () => api.get("/admin/dashboard");

export const getBusinesses = (params = {}) =>
  api.get("/admin/businesses", {
    params,
  });

export const getBusinessById = (id) =>
  api.get(`/admin/businesses/${encodeURIComponent(id)}`);

export const updateBusiness = (id, data) =>
  api.put(`/admin/businesses/${encodeURIComponent(id)}`, data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${encodeURIComponent(id)}`);

export const deleteAllUsers = () => api.delete("/admin/users/all");

export const deleteBusiness = (id) =>
  api.delete(`/admin/businesses/${encodeURIComponent(id)}`);

export const deactivateBusiness = (id) =>
  api.put(`/admin/businesses/${encodeURIComponent(id)}`, {
    isActive: false,
  });

export const activateBusiness = (id) =>
  api.put(`/admin/businesses/${encodeURIComponent(id)}`, {
    isActive: true,
  });

/* =========================================================
   REGISTRATION REQUESTS
========================================================= */

export const getRegistrationRequests = () =>
  api.get("/admin/registration-requests");

export const getRegistrationRequestById = (id) =>
  api.get(`/admin/registration-requests/${encodeURIComponent(id)}`);

export const approveRegistrationRequest = (id) =>
  api.patch(`/admin/registration-requests/${encodeURIComponent(id)}/approve`);

export const rejectRegistrationRequest = (id) =>
  api.patch(`/admin/registration-requests/${encodeURIComponent(id)}/reject`);

/* =========================================================
   USERS
========================================================= */

export const getUsers = (params = {}) =>
  api.get("/admin/users", {
    params,
  });

/* =========================================================
   REVIEW TEMPLATES
========================================================= */

export const getReviewTemplates = () => api.get("/admin/review-templates");

export const createReviewTemplate = (data) =>
  api.post("/admin/review-templates", data);

export const updateReviewTemplate = (id, data) =>
  api.put(`/admin/review-templates/${encodeURIComponent(id)}`, data);

export const deleteReviewTemplate = (id) =>
  api.delete(`/admin/review-templates/${encodeURIComponent(id)}`);

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

export const getSettings = () => api.get("/admin/settings");

export const updateSettings = (data) => api.put("/admin/settings", data);

export default {
  getDashboardStats,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  deactivateBusiness,
  activateBusiness,

  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,

  getUsers,

  getReviewTemplates,
  createReviewTemplate,
  updateReviewTemplate,
  deleteReviewTemplate,

  getSettings,
  updateSettings,
  deleteUser,
  deleteAllUsers,
};
