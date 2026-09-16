import express from "express";

import {
  getBusinessProfile,
  updateBusinessProfile,
  getPublicBusiness,
  updatePublicPage,
  getBusinessAnalytics,
  regenerateBusinessId,
  updateBusinessStatus,
} from "../controllers/businessController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/public/:businessId",
  getPublicBusiness
);

/*
|--------------------------------------------------------------------------
| Protected Business Routes
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

router.get(
  "/profile",
  getBusinessProfile
);

router.put(
  "/profile",
  updateBusinessProfile
);

router.put(
  "/public-page",
  updatePublicPage
);

router.get(
  "/analytics",
  getBusinessAnalytics
);

router.post(
  "/regenerate-id",
  regenerateBusinessId
);

router.patch(
  "/status",
  updateBusinessStatus
);

export default router;