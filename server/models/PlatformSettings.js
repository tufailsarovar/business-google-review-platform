import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "TapReview",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    contactAddress: {
      type: String,
      default: "",
      trim: true,
    },

    websiteUrl: {
      type: String,
      default: "",
      trim: true,
    },

    defaultCurrency: {
      type: String,
      default: "INR",
      trim: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    allowReviewGeneration: {
      type: Boolean,
      default: true,
    },

    requireEmailVerification: {
      type: Boolean,
      default: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    paymentNotifications: {
      type: Boolean,
      default: true,
    },

    ownerNotifications: {
      type: Boolean,
      default: true,
    },

    sessionTimeout: {
      type: Number,
      default: 60,
      min: 5,
    },

    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    smtpHost: {
      type: String,
      default: "",
      trim: true,
    },

    smtpPort: {
      type: Number,
      default: 587,
    },

    smtpUsername: {
      type: String,
      default: "",
      trim: true,
    },

    smtpPassword: {
      type: String,
      default: "",
      select: false,
    },

    smtpSecure: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const PlatformSettings =
  mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", platformSettingsSchema);

export default PlatformSettings;
