import api from "./api";

export const getGoogleSettings = () =>
  api.get("/google/settings");

export const saveGoogleSettings = data =>
  api.post("/google/settings", data);

export const updateGoogleReviewUrl = reviewUrl =>
  api.put("/google/review-url", {
    reviewUrl,
  });

export const getPublicGoogleReviewUrl = businessId =>
  api.get(`/google/public/${businessId}`);

export const disableGoogleReview = () =>
  api.patch("/google/disable");

export const enableGoogleReview = () =>
  api.patch("/google/enable");

export const openGoogleReview = url => {
  if (!url) {
    throw new Error(
      "Google review URL is not configured."
    );
  }

  try {
    const parsedUrl = new URL(url);

    if (
      !["http:", "https:"].includes(
        parsedUrl.protocol
      ) ||
      !/(^|\.)google\.[a-z.]+$/i.test(
        parsedUrl.hostname
      )
    ) {
      throw new Error(
        "Invalid Google review URL."
      );
    }

    window.location.assign(
      parsedUrl.toString()
    );
  } catch (error) {
    throw new Error(
      error?.message ||
        "Invalid Google review URL."
    );
  }
};

export default {
  getGoogleSettings,
  saveGoogleSettings,
  updateGoogleReviewUrl,
  getPublicGoogleReviewUrl,
  disableGoogleReview,
  enableGoogleReview,
  openGoogleReview,
};