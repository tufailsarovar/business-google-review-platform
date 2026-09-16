import jwt from "jsonwebtoken";

const generateToken = payload => {
  if (!payload) {
    throw new Error(
      "Token payload is required."
    );
  }

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "7d",
    }
  );
};

export default generateToken;