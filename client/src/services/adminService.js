import api from "./api";

export const getDashboardStats = () =>
  api.get("/admin/dashboard");

export const getBusinesses = (params = {}) =>
  api.get("/admin/businesses", {
    params,
  });

export const getBusinessById = (id) =>
  api.get(
    `/admin/businesses/${encodeURIComponent(id)}`
  );

export const updateBusiness = (id, data) =>
  api.put(
    `/admin/businesses/${encodeURIComponent(id)}`,
    data
  );

export const deleteBusiness = (id) =>
  api.delete(
    `/admin/businesses/${encodeURIComponent(id)}`
  );

export const deactivateBusiness = (id) =>
  api.put(
    `/admin/businesses/${encodeURIComponent(id)}`,
    {
      isActive: false,
    }
  );

export const activateBusiness = (id) =>
  api.put(
    `/admin/businesses/${encodeURIComponent(id)}`,
    {
      isActive: true,
    }
  );

export const getUsers = (params = {}) =>
  api.get("/admin/users", {
    params,
  });

export const getReviewTemplates = () =>
  api.get("/admin/review-templates");

export const createReviewTemplate = (data) =>
  api.post(
    "/admin/review-templates",
    data
  );

export const updateReviewTemplate = (
  id,
  data
) =>
  api.put(
    `/admin/review-templates/${encodeURIComponent(id)}`,
    data
  );

export const deleteReviewTemplate = (id) =>
  api.delete(
    `/admin/review-templates/${encodeURIComponent(id)}`
  );

export const getSettings = () =>
  api.get("/admin/settings");

export const updateSettings = (data) =>
  api.put("/admin/settings", data);

export default {
  getDashboardStats,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  deactivateBusiness,
  activateBusiness,
  getUsers,
  getReviewTemplates,
  createReviewTemplate,
  updateReviewTemplate,
  deleteReviewTemplate,
  getSettings,
  updateSettings,
};