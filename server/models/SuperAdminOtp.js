import mongoose from "mongoose";

const superAdminOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const SuperAdminOtp =
  mongoose.models.SuperAdminOtp ||
  mongoose.model("SuperAdminOtp", superAdminOtpSchema);

export default SuperAdminOtp;
