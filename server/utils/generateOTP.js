import crypto from "crypto";

const generateOTP = (length = 6) => {
  if (!Number.isInteger(length) || length < 4 || length > 10) {
    throw new Error("OTP length must be between 4 and 10 digits.");
  }

  const min = 10 ** (length - 1);
  const max = 10 ** length;

  return crypto.randomInt(min, max).toString();
};

export default generateOTP;