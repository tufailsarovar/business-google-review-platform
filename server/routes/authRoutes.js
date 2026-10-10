import express from "express";

import {
  signup,
  login,
  adminLogin,
  getMe,
  sendEmailOtp,
  verifyEmailOtp,
  completeBusinessRegistration,
  googleLogin,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Email OTP authentication
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

// Complete business registration after email verification
router.post("/complete-registration", completeBusinessRegistration);

// Google authentication
router.post("/google", googleLogin);

// Admin authentication
router.post("/admin-login", adminLogin);

// Existing endpoints
router.get("/me", authMiddleware, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

export default router;