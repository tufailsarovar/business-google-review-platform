import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema(
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
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastSentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verificationTokenHash: {
      type: String,
      default: undefined,
      select: false,
    },

    verificationTokenExpiresAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtp =
  mongoose.models.EmailOtp || mongoose.model("EmailOtp", emailOtpSchema);

export default EmailOtp;
