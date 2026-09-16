import mongoose from "mongoose";

const passwordResetSchema =
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

passwordResetSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model(
    "PasswordReset",
    passwordResetSchema
  );

export default PasswordReset;