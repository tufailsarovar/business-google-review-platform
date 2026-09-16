import express from "express";

import {
  sendSupportRequest,
  contactAdmin,
} from "../controllers/supportController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Support Route
|--------------------------------------------------------------------------
*/

router.post(
  "/send",
  sendSupportRequest
);

/*
|--------------------------------------------------------------------------
| Protected Business Support Route
|--------------------------------------------------------------------------
*/

router.post(
  "/contact-admin",
  authMiddleware,
  contactAdmin
);

export default router;