import crypto from "crypto";
import bcrypt from "bcryptjs";

import Business from "../models/Business.js";
import PasswordReset from "../models/PasswordReset.js";
import EmailVerification from "../models/EmailVerification.js";
import EmailOtp from "../models/EmailOtp.js";
import Admin from "../models/Admin.js";
import PlatformSettings from "../models/PlatformSettings.js";

import generateToken from "../utils/generateToken.js";
import generateBusinessId from "../utils/generateBusinessId.js";

import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendEmailOtp as sendEmailOtpEmail,
  sendRegistrationConfirmationEmail,
} from "../services/emailService.js";
import SuperAdminOtp from "../models/SuperAdminOtp.js";

/* =========================================================
   HELPERS
========================================================= */

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const safeUser = (business) => ({
  id: business._id,
  businessId: business.businessId,
  name: business.name,
  businessName: business.businessName,
  email: business.email,
  phone: business.phone,
  role: business.role || "business",
  isEmailVerified: business.isEmailVerified,
  isActive: business.isActive !== false,
  approvalStatus: business.approvalStatus,
});

const createBusinessId = async (businessName) => {
  let businessId = generateBusinessId(businessName);

  while (await Business.exists({ businessId })) {
    businessId = generateBusinessId(businessName);
  }

  return businessId;
};

const createBusinessSession = (business, res) => {
  const token = generateToken({
    id: business._id,
    role: business.role || "business",
  });

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: safeUser(business),
  });
};

const checkBusinessAccess = (business, res) => {
  if (business.approvalStatus === "pending") {
    res.status(403).json({
      success: false,
      message: "Your registration request is still pending admin approval.",
      approvalStatus: "pending",
    });

    return false;
  }

  if (business.approvalStatus === "rejected") {
    res.status(403).json({
      success: false,
      message:
        "Your registration request was rejected. Please contact support.",
      approvalStatus: "rejected",
    });

    return false;
  }

  if (business.approvalStatus !== "approved") {
    res.status(403).json({
      success: false,
      message: "Your business account has not been approved yet.",
    });

    return false;
  }

  if (business.isActive === false) {
    res.status(403).json({
      success: false,
      message: "Your business account is currently inactive.",
    });

    return false;
  }

  return true;
};

const createVerificationToken = async (businessId) => {
  const token = crypto.randomBytes(32).toString("hex");

  await EmailVerification.deleteMany({ business: businessId });

  await EmailVerification.create({
    business: businessId,
    token: hashValue(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return token;
};

/* =========================================================
   SEND EMAIL OTP
========================================================= */

export const sendEmailOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const purpose =
      req.body.purpose === "registration" ? "registration" : "login";

    const existing = await Business.findOne({ email });

    if (purpose === "login" && !existing) {
      return res.status(404).json({
        success: false,
        message:
          "No business account found with this email. Please create an account first.",
      });
    }

    if (purpose === "registration" && existing) {
      return res.status(409).json({
        success: false,
        alreadyRegistered: true,
        message: "This email is already registered. Please sign in instead.",
      });
    }

    if (existing && !checkBusinessAccess(existing, res)) return;

    if (purpose === "registration") {
      const settings = await PlatformSettings.findOne();

      if (settings?.allowRegistration === false) {
        return res.status(403).json({
          success: false,
          message: "New business registrations are currently disabled.",
        });
      }
    }

    const now = Date.now();
    const previous = await EmailOtp.findOne({ email });

    if (
      previous?.lastSentAt &&
      now - new Date(previous.lastSentAt).getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another code.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await EmailOtp.findOneAndUpdate(
      { email },
      {
        $set: {
          otpHash: hashValue(otp),
          expiresAt: new Date(now + 5 * 60 * 1000),
          attempts: 0,
          lastSentAt: new Date(now),
          verified: false,
        },
        $unset: {
          verificationTokenHash: 1,
          verificationTokenExpiresAt: 1,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendEmailOtpEmail({ email, otp });
    } catch (emailError) {
      await EmailOtp.deleteOne({ email });

      console.error("Email OTP delivery failed:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Unable to send the verification code. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email. It expires in 5 minutes.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY EMAIL OTP
========================================================= */

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and the six-digit verification code.",
      });
    }

    const record = await EmailOtp.findOne({ email }).select("+otpHash");

    if (!record || record.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code is invalid or expired. Request a new one.",
      });
    }

    if (record.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: record._id });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    if (record.otpHash !== hashValue(otp)) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect verification code.",
        attemptsRemaining: Math.max(0, 5 - record.attempts),
      });
    }

    // Existing business: log in instead of redirecting to signup.
    const business = await Business.findOne({ email });

    if (business) {
      await EmailOtp.deleteOne({ _id: record._id });

      if (!checkBusinessAccess(business, res)) return;

      if (!business.isEmailVerified) {
        business.isEmailVerified = true;
        await business.save();
      }

      return createBusinessSession(business, res);
    }

    // New email: continue the registration flow.
    const settings = await PlatformSettings.findOne();

    if (settings?.allowRegistration === false) {
      await EmailOtp.deleteOne({ _id: record._id });

      return res.status(403).json({
        success: false,
        message: "New business registrations are currently disabled.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    record.verified = true;
    record.verificationTokenHash = hashValue(verificationToken);
    record.verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      registrationRequired: true,
      verificationToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   COMPLETE BUSINESS REGISTRATION
========================================================= */

export const completeBusinessRegistration = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || req.body.ownerName || "").trim();
    const businessName = String(req.body.businessName || "").trim();
    const phone = String(req.body.phone || req.body.mobile || "").trim();

    const verificationToken = String(req.body.verificationToken || "").trim();

    const googleCredential = String(req.body.googleCredential || "").trim();

    if (!email || !name || !businessName || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Email, owner name, business name and mobile number are required.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      name.length > 100 ||
      businessName.length > 150 ||
      phone.length > 25
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details.",
      });
    }

    const settings = await PlatformSettings.findOne();

    if (settings?.allowRegistration === false) {
      return res.status(403).json({
        success: false,
        message: "New business registrations are currently disabled.",
      });
    }

    if (await Business.exists({ email })) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    let verifiedByGoogle = false;

    if (googleCredential) {
      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (!clientId) {
        return res.status(503).json({
          success: false,
          message: "Google sign-in is not configured on the server.",
        });
      }

      const googleResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
          googleCredential,
        )}`,
      );

      if (!googleResponse.ok) {
        return res.status(401).json({
          success: false,
          message: "Google sign-in verification failed.",
        });
      }

      const googleData = await googleResponse.json();

      if (
        googleData.aud !== clientId ||
        normalizeEmail(googleData.email) !== email ||
        googleData.email_verified !== "true"
      ) {
        return res.status(401).json({
          success: false,
          message: "Google account verification failed.",
        });
      }

      verifiedByGoogle = true;
    }

    if (!verifiedByGoogle) {
      if (!verificationToken) {
        return res.status(401).json({
          success: false,
          message: "Verify your email before completing registration.",
        });
      }

      const record = await EmailOtp.findOne({
        email,
        verified: true,
        verificationTokenHash: hashValue(verificationToken),
        verificationTokenExpiresAt: { $gt: new Date() },
      }).select("+verificationTokenHash");

      if (!record) {
        return res.status(401).json({
          success: false,
          message:
            "Email verification expired or invalid. Verify your email again.",
        });
      }

      await EmailOtp.deleteOne({ _id: record._id });
    }

    const businessId = await createBusinessId(businessName);

    const business = await Business.create({
      businessId,
      name,
      businessName,
      email,
      phone,
      role: "business",
      approvalStatus: "pending",
      isActive: false,
      isEmailVerified: true,
      status: "inactive",
    });

    // Do not undo registration if confirmation email delivery fails.
    let confirmationEmailSent = false;

    try {
      await sendRegistrationConfirmationEmail({
        email: business.email,
        name: business.name,
        businessName: business.businessName,
        businessId: business.businessId,
      });

      confirmationEmailSent = true;
    } catch (emailError) {
      console.error(
        "Registration confirmation email failed:",
        emailError.message,
      );
    }

    return res.status(201).json({
      success: true,
      registrationPending: true,
      confirmationEmailSent,
      message: confirmationEmailSent
        ? "Registration submitted successfully. A confirmation email has been sent. Your account is pending admin approval."
        : "Registration submitted successfully, but the confirmation email could not be sent. Your account is pending admin approval.",
      user: {
        id: business._id,
        businessId: business.businessId,
        name: business.name,
        businessName: business.businessName,
        email: business.email,
        phone: business.phone,
        approvalStatus: business.approvalStatus,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or business ID already exists.",
      });
    }

    next(error);
  }
};

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export const googleLogin = async (req, res, next) => {
  try {
    const credential = String(
      req.body.credential || req.body.idToken || "",
    ).trim();

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not configured on the server.",
      });
    }

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential,
      )}`,
    );

    if (!googleResponse.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google sign-in credential.",
      });
    }

    const googleData = await googleResponse.json();

    if (
      googleData.aud !== clientId ||
      !googleData.email ||
      googleData.email_verified !== "true"
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified.",
      });
    }

    const email = normalizeEmail(googleData.email);
    const business = await Business.findOne({ email });

    if (!business) {
      const settings = await PlatformSettings.findOne();

      if (settings?.allowRegistration === false) {
        return res.status(403).json({
          success: false,
          message: "New business registrations are currently disabled.",
        });
      }

      return res.status(200).json({
        success: true,
        registrationRequired: true,
        googleCredential: credential,
        email,
        name: String(googleData.name || ""),
        message: "Complete your business details to submit your registration.",
      });
    }

    if (!business.isEmailVerified) {
      business.isEmailVerified = true;
      await business.save();
    }

    if (!checkBusinessAccess(business, res)) return;

    return createBusinessSession(business, res);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LEGACY BUSINESS SIGNUP - DISABLED
========================================================= */

export const signup = async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Password-based business signup is disabled. Use email OTP or Google sign-in.",
  });
};

/* =========================================================
   ADMIN LOGIN
========================================================= */

export const adminLogin = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    if (!(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken({
      id: admin._id,
      role: "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LEGACY BUSINESS LOGIN - DISABLED
========================================================= */

export const login = async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Password-based business login is disabled. Use email OTP or Google sign-in.",
  });
};

/* =========================================================
   GET CURRENT USER
========================================================= */

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (role === "admin") {
      const admin = await Admin.findById(userId).select("-password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found.",
        });
      }

      if (admin.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive.",
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: "admin",
          isActive: admin.isActive,
        },
      });
    }

    const business = await Business.findById(userId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business account not found.",
      });
    }

    if (!checkBusinessAccess(business, res)) return;

    return res.status(200).json({
      success: true,
      user: safeUser(business),
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LEGACY EMAIL VERIFICATION LINK
========================================================= */

export const verifyEmail = async (req, res, next) => {
  try {
    const token = String(req.params.token || "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const verification = await EmailVerification.findOne({
      token: hashValue(token),
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or expired.",
      });
    }

    const business = await Business.findById(verification.business);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business account not found.",
      });
    }

    business.isEmailVerified = true;
    await business.save();

    await EmailVerification.deleteMany({ business: business._id });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RESEND EMAIL VERIFICATION
========================================================= */

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const business = await Business.findOne({ email });

    if (!business) {
      return res.status(200).json({
        success: true,
        message: "If eligible, a verification email will be sent.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your business account must be approved before email verification.",
      });
    }

    if (business.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    const token = await createVerificationToken(business._id);

    await sendVerificationEmail({
      email: business.email,
      name: business.name,
      token,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LEGACY FORGOT PASSWORD - DISABLED
========================================================= */

export const forgotPassword = async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Business passwords are disabled. Sign in using email OTP or Google.",
  });
};

/* =========================================================
   LEGACY RESET PASSWORD - DISABLED
========================================================= */

export const resetPassword = async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Business passwords are disabled. Sign in using email OTP or Google.",
  });
};

/* =========================================================
   LEGACY CHANGE PASSWORD - DISABLED
========================================================= */

export const changePassword = async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Business passwords are disabled. Sign in using email OTP or Google.",
  });
};

/* =========================================================
   SUPER ADMIN AUTHENTICATION
   Google + Email OTP
========================================================= */

const getSuperAdminEmails = () =>
  String(process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

const isAuthorizedSuperAdmin = (email) =>
  getSuperAdminEmails().includes(normalizeEmail(email));

const createSuperAdminSession = async (admin, res) => {
  if (!admin || admin.isActive === false) {
    return res.status(403).json({
      success: false,
      message: "Super Admin account is inactive.",
    });
  }

  if (!isAuthorizedSuperAdmin(admin.email)) {
    return res.status(403).json({
      success: false,
      message: "This account is not authorized for Super Admin access.",
    });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = generateToken({
    id: admin._id,
    role: "admin",
    superAdmin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Super Admin login successful.",
    token,
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      superAdmin: true,
      isActive: admin.isActive,
    },
  });
};

/* =========================================================
   SEND SUPER ADMIN EMAIL OTP
========================================================= */

export const sendSuperAdminEmailOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!isAuthorizedSuperAdmin(email)) {
      return res.status(403).json({
        success: false,
        message: "This email is not authorized for Super Admin access.",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "No active Super Admin account exists for this email.",
      });
    }

    const now = Date.now();
    const previous = await SuperAdminOtp.findOne({ email });

    if (
      previous?.lastSentAt &&
      now - new Date(previous.lastSentAt).getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait one minute before requesting another code.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await SuperAdminOtp.findOneAndUpdate(
      { email },
      {
        $set: {
          otpHash: hashValue(otp),
          expiresAt: new Date(now + 5 * 60 * 1000),
          attempts: 0,
          lastSentAt: new Date(now),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendEmailOtpEmail({ email, otp });
    } catch (emailError) {
      await SuperAdminOtp.deleteOne({ email });

      console.error("Super Admin OTP delivery failed:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Unable to send the OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Super Admin verification code sent. It expires in 5 minutes.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY SUPER ADMIN EMAIL OTP
========================================================= */

export const verifySuperAdminEmailOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and six-digit verification code.",
      });
    }

    if (!isAuthorizedSuperAdmin(email)) {
      return res.status(403).json({
        success: false,
        message: "This email is not authorized for Super Admin access.",
      });
    }

    const record = await SuperAdminOtp.findOne({ email }).select("+otpHash");

    if (!record || record.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Request a new code.",
      });
    }

    if (record.attempts >= 5) {
      await SuperAdminOtp.deleteOne({ _id: record._id });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    if (record.otpHash !== hashValue(otp)) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect verification code.",
        attemptsRemaining: Math.max(0, 5 - record.attempts),
      });
    }

    const admin = await Admin.findOne({ email });

    await SuperAdminOtp.deleteOne({ _id: record._id });

    if (!admin || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "No active Super Admin account exists for this email.",
      });
    }

    return await createSuperAdminSession(admin, res);
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   SUPER ADMIN GOOGLE LOGIN
========================================================= */

export const superAdminGoogleLogin = async (req, res, next) => {
  try {
    const credential = String(
      req.body.credential || req.body.idToken || "",
    ).trim();

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not configured on the server.",
      });
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential,
      )}`,
    );

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google sign-in credential.",
      });
    }

    const googleData = await response.json();
    const email = normalizeEmail(googleData.email);

    if (
      googleData.aud !== clientId ||
      !email ||
      googleData.email_verified !== "true"
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified.",
      });
    }

    if (!isAuthorizedSuperAdmin(email)) {
      return res.status(403).json({
        success: false,
        message:
          "This Google account is not authorized for Super Admin access.",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "No existing Super Admin account exists for this email.",
      });
    }

    return await createSuperAdminSession(admin, res);
  } catch (error) {
    next(error);
  }
};
