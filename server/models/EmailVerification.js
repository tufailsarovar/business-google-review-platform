import mongoose from "mongoose";

const emailVerificationSchema =
  new mongoose.Schema(
    {
      business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true,
      },

      token: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

emailVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const EmailVerification =
  mongoose.models.EmailVerification ||
  mongoose.model(
    "EmailVerification",
    emailVerificationSchema
  );

export default EmailVerification;