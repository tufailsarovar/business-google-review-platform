import express from "express";

import {
  getDashboardStats,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  activateBusiness,
  deactivateBusiness,
  deleteBusiness,
  getUsers,
  getAdminProfile,

  getReviewTemplates,
  getReviewTemplateById,
  createReviewTemplate,
  updateReviewTemplate,
  deleteReviewTemplate,

  getAdminSettings,
  updateAdminSettings,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

/* =========================================================
   ADMIN PROFILE
========================================================= */

router.get("/profile", getAdminProfile);

/* =========================================================
   DASHBOARD
========================================================= */

router.get("/dashboard", getDashboardStats);

/* =========================================================
   BUSINESSES
========================================================= */

router.get("/businesses", getBusinesses);

router.get(
  "/businesses/:id",
  getBusinessById
);

router.put(
  "/businesses/:id",
  updateBusiness
);

router.patch(
  "/businesses/:id/activate",
  activateBusiness
);

router.patch(
  "/businesses/:id/deactivate",
  deactivateBusiness
);

router.delete(
  "/businesses/:id",
  deleteBusiness
);

/* =========================================================
   USERS
========================================================= */

router.get("/users", getUsers);

/* =========================================================
   REVIEW TEMPLATES
========================================================= */

router.get(
  "/review-templates",
  getReviewTemplates
);

router.get(
  "/review-templates/:id",
  getReviewTemplateById
);

router.post(
  "/review-templates",
  createReviewTemplate
);

router.put(
  "/review-templates/:id",
  updateReviewTemplate
);

router.delete(
  "/review-templates/:id",
  deleteReviewTemplate
);

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

router.get(
  "/settings",
  getAdminSettings
);

router.put(
  "/settings",
  updateAdminSettings
);

export default router;