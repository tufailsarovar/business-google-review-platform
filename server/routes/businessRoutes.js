
import express from "express";

import {
  getBusinessProfile,
  updateBusinessProfile,
  getPublicBusiness,
  updatePublicPage,
  getBusinessAnalytics,
  regenerateBusinessId,
  updateBusinessStatus,
  getBusinessSettings,
updateBusinessSettings,
} from "../controllers/businessController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route
router.get("/public/:businessId", getPublicBusiness);

// Protected business routes
router.use(authMiddleware);

router.get("/profile", getBusinessProfile);
router.get("/settings", getBusinessSettings);
router.put("/settings", updateBusinessSettings);

router.put(
  "/profile",
  uploadSingleImage,
  updateBusinessProfile
);

router.put("/public-page", updatePublicPage);

router.get("/analytics", getBusinessAnalytics);

router.post("/regenerate-id", regenerateBusinessId);

router.patch("/status", updateBusinessStatus);


export default router;
