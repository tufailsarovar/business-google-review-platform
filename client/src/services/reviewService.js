import api from "./api";

export const generateReview = (data) =>
  api.post("/reviews/generate", data);

export const recordRating = (data) =>
  api.post("/reviews/record-rating", data);

export const recordVisitor = (businessId) =>
  api.post("/reviews/record-visitor", {
    businessId:
      typeof businessId === "object"
        ? businessId.businessId
        : businessId,
  });

export const getReviewStats = () =>
  api.get("/reviews/stats");

export default {
  generateReview,
  recordRating,
  recordVisitor,
  getReviewStats,
};