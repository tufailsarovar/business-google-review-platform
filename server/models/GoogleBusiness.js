import mongoose from "mongoose";

const googleBusinessSchema =
  new mongoose.Schema(
    {
      business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        unique: true,
        index: true,
      },

      reviewUrl: {
        type: String,
        required: true,
        trim: true,
      },

      placeId: {
        type: String,
        trim: true,
        default: "",
      },

      locationName: {
        type: String,
        trim: true,
        default: "",
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

const GoogleBusiness =
  mongoose.models.GoogleBusiness ||
  mongoose.model(
    "GoogleBusiness",
    googleBusinessSchema
  );

export default GoogleBusiness;