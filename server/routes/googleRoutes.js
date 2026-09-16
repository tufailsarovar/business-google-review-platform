import express from "express";

import {
  getGoogleSettings,
  saveGoogleSettings,
  updateGoogleReviewUrl,
  getPublicGoogleReviewUrl,
  disableGoogleReview,
  enableGoogleReview,
} from "../controllers/googleController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Route
|--------------------------------------------------------------------------
*/

router.get(
  "/public/:businessId",
  getPublicGoogleReviewUrl
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

router.get(
  "/settings",
  getGoogleSettings
);

router.post(
  "/settings",
  saveGoogleSettings
);

router.put(
  "/review-url",
  updateGoogleReviewUrl
);

router.patch(
  "/disable",
  disableGoogleReview
);

router.patch(
  "/enable",
  enableGoogleReview
);

export default router;