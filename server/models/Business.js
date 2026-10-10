import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["business", "admin"],
      default: "business",
      index: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    googleReviewUrl: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      trim: true,
      default: "",
    },

    publicPageTitle: {
      type: String,
      trim: true,
      default: "",
    },

    publicPageDescription: {
      type: String,
      trim: true,
      default: "",
    },

    publicPageEnabled: {
      type: Boolean,
      default: true,
    },
    aiSuggestionsEnabled: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

    /*
     * Account access status.
     *
     * pending  = signup request submitted, waiting for admin approval
     * approved = admin approved the business and login is allowed
     * rejected = admin rejected the signup request
     */
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
      index: true,
    },

    reviewStats: {
      totalVisitors: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },

      oneStar: {
        type: Number,
        default: 0,
        min: 0,
      },

      twoStars: {
        type: Number,
        default: 0,
        min: 0,
      },

      threeStars: {
        type: Number,
        default: 0,
        min: 0,
      },

      fourStars: {
        type: Number,
        default: 0,
        min: 0,
      },

      fiveStars: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
  },
);

businessSchema.index({
  businessName: "text",
  name: "text",
  email: "text",
});

businessSchema.index({
  approvalStatus: 1,
  createdAt: -1,
});

const Business =
  mongoose.models.Business || mongoose.model("Business", businessSchema);

export default Business;
