import express from "express";

import {
  signup,
  login,
  adminLogin,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.post(
  "/admin-login",
  adminLogin
);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;