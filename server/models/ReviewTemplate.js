import mongoose from "mongoose";

const reviewTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    template: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReviewTemplate =
  mongoose.models.ReviewTemplate ||
  mongoose.model(
    "ReviewTemplate",
    reviewTemplateSchema
  );

export default ReviewTemplate;