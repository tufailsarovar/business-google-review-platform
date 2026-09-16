import express from "express";

import {
  generateReview,
  getReviewStats,
  recordRating,
  recordVisitor,
} from "../controllers/reviewController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Review Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/generate",
  generateReview
);

router.post(
  "/record-rating",
  recordRating
);

router.post(
  "/record-visitor",
  recordVisitor
);

/*
|--------------------------------------------------------------------------
| Protected Business Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  authMiddleware,
  getReviewStats
);

export default router;