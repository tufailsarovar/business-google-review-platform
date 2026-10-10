import api from "./api";

export const getMyBusiness = () =>
  api.get("/business/profile");

export const getPublicBusiness = businessId =>
  api.get(
    `/business/public/${encodeURIComponent(
      businessId
    )}`
  );

export const updateBusiness = data =>
  api.put("/business/profile", data);

export const updatePublicPage = data =>
  api.put("/business/public-page", data);

export const getBusinessAnalytics = () =>
  api.get("/business/analytics");

export const regenerateBusinessId = () =>
  api.post("/business/regenerate-id");

export const updateBusinessStatus = isActive =>
  api.patch("/business/status", {
    isActive,
  });

export const deleteBusiness = () =>
  api.delete("/business/profile");

export const getBusinesses = params =>
  api.get("/admin/businesses", {
    params,
  });

export const getBusinessById = id =>
  api.get(
    `/admin/businesses/${encodeURIComponent(id)}`
  );

export const adminUpdateBusiness = (id, data) =>
  api.put(
    `/admin/businesses/${encodeURIComponent(id)}`,
    data
  );

export const adminDeleteBusiness = id =>
  api.delete(
    `/admin/businesses/${encodeURIComponent(id)}`
  );

  export const getBusinessSettings = () =>
  api.get("/business/settings");

export const updateBusinessSettings = data =>
  api.put("/business/settings", data);

export default {
  getMyBusiness,
  getPublicBusiness,
  updateBusiness,
  updatePublicPage,
  getBusinessAnalytics,
  regenerateBusinessId,
  updateBusinessStatus,
  deleteBusiness,
  getBusinesses,
  getBusinessById,
  adminUpdateBusiness,
  adminDeleteBusiness,
};