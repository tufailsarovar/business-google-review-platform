import crypto from "crypto";
import bcrypt from "bcryptjs";

import Business from "../models/Business.js";
import PasswordReset from "../models/PasswordReset.js";
import EmailVerification from "../models/EmailVerification.js";

import generateToken from "../utils/generateToken.js";
import generateBusinessId from "../utils/generateBusinessId.js";
import Admin from "../models/Admin.js";

import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../services/emailService.js";
import PlatformSettings from "../models/PlatformSettings.js";

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const createVerificationToken = async (businessId) => {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await EmailVerification.deleteMany({
    business: businessId,
  });

  await EmailVerification.create({
    business: businessId,
    token: tokenHash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return token;
};

/*
 * BUSINESS SIGNUP
 *
 * Signup only creates a pending registration request.
 * No JWT is generated.
 * No verification email is sent at this stage.
 * Admin must approve the request first.
 */
export const signup = async (req, res, next) => {
  try {
    const { name, businessName, email, password, phone } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!name || !businessName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, business name, email and password are required.",
      });
    }

    const platformSettings = await PlatformSettings.findOne();

    if (platformSettings?.allowRegistration === false) {
      return res.status(403).json({
        success: false,
        message: "New business registrations are currently disabled.",
      });
    }

    // EXISTING CODE — keep this below
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const existingBusiness = await Business.findOne({
      email: normalizedEmail,
    });

    if (existingBusiness) {
      if (existingBusiness.approvalStatus === "pending") {
        return res.status(409).json({
          success: false,
          message:
            "Your registration request is already pending admin approval.",
        });
      }

      if (existingBusiness.approvalStatus === "approved") {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      if (existingBusiness.approvalStatus === "rejected") {
        return res.status(409).json({
          success: false,
          message:
            "This registration request was rejected. Please contact support.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let businessId = generateBusinessId(businessName);

    while (await Business.exists({ businessId })) {
      businessId = generateBusinessId(businessName);
    }

    const business = await Business.create({
      businessId,

      name: String(name).trim(),

      businessName: String(businessName).trim(),

      email: normalizedEmail,

      password: hashedPassword,

      phone: phone ? String(phone).trim() : "",

      role: "business",

      approvalStatus: "pending",

      isActive: false,

      isEmailVerified: false,

      status: "inactive",
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration request submitted successfully. Your account is waiting for admin approval. You will receive your Business ID and login link by email after approval.",
      registrationPending: true,
      user: {
        id: business._id,
        name: business.name,
        businessName: business.businessName,
        email: business.email,
        phone: business.phone,
        approvalStatus: business.approvalStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select("+password");

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

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const business = await Business.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!business) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /*
     * Approval check must happen before
     * allowing business login.
     */
    if (business.approvalStatus === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your registration request is still pending admin approval.",
      });
    }

    if (business.approvalStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message:
          "Your registration request was rejected. Please contact support.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your business account has not been approved yet.",
      });
    }

    if (business.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your business account is currently inactive.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, business.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({
      id: business._id,
      role: business.role || "business",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

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

    if (business.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your business account has not been approved.",
      });
    }

    if (business.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your business account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const verification = await EmailVerification.findOne({
      token: tokenHash,
      expiresAt: {
        $gt: new Date(),
      },
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

    await EmailVerification.deleteMany({
      business: business._id,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const business = await Business.findOne({
      email: normalizedEmail,
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
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

    const verificationToken = await createVerificationToken(business._id);

    await sendVerificationEmail({
      email: business.email,
      name: business.name,
      token: verificationToken,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const business = await Business.findOne({
      email: normalizedEmail,
    });

    if (!business) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordReset.deleteMany({
      business: business._id,
    });

    await PasswordReset.create({
      business: business._id,
      token: tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    try {
      await sendForgotPasswordEmail({
        email: business.email,
        name: business.name,
        token: rawToken,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRequest = await PasswordReset.findOne({
      token: tokenHash,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired.",
      });
    }

    const business = await Business.findById(resetRequest.business).select(
      "+password",
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business account not found.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your business account is not approved.",
      });
    }

    business.password = await bcrypt.hash(password, 12);

    await business.save();

    await PasswordReset.deleteMany({
      business: business._id,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const business = await Business.findById(userId).select("+password");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business account not found.",
      });
    }

    if (business.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your business account is not approved.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      business.password,
    );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    business.password = await bcrypt.hash(newPassword, 12);

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
