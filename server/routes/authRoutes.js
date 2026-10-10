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
  sendSuperAdminEmailOtp,
  verifySuperAdminEmailOtp,
  superAdminGoogleLogin,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   BUSINESS EMAIL OTP AUTHENTICATION
========================================================= */

router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

router.post("/complete-registration", completeBusinessRegistration);

/* =========================================================
   BUSINESS GOOGLE AUTHENTICATION
========================================================= */

router.post("/google", googleLogin);

/* =========================================================
   SUPER ADMIN AUTHENTICATION
========================================================= */

// Send Super Admin OTP
router.post("/super-admin/send-email-otp", sendSuperAdminEmailOtp);

// Verify Super Admin OTP
router.post("/super-admin/verify-email-otp", verifySuperAdminEmailOtp);

// Super Admin Google login
router.post("/super-admin/google", superAdminGoogleLogin);

/* =========================================================
   EXISTING ADMIN PASSWORD LOGIN
========================================================= */

router.post("/admin-login", adminLogin);

/* =========================================================
   CURRENT USER
========================================================= */

router.get("/me", authMiddleware, getMe);

/* =========================================================
   LEGACY BUSINESS AUTHENTICATION
========================================================= */

router.post("/signup", signup);
router.post("/login", login);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/change-password", authMiddleware, changePassword);

export default router;
