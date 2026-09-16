import bcrypt from "bcryptjs";

import Business from "../models/Business.js";
import generateToken from "../utils/generateToken.js";

export const hashPassword = async password => {
  if (!password) {
    throw new Error("Password is required.");
  }

  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password,
  hashedPassword
) => {
  if (!password || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(
    password,
    hashedPassword
  );
};

export const findBusinessByEmail = async email => {
  if (!email) {
    return null;
  }

  return Business.findOne({
    email: String(email)
      .trim()
      .toLowerCase(),
  }).select("+password");
};

export const findBusinessById = async id => {
  if (!id) {
    return null;
  }

  return Business.findById(id);
};

export const createAuthToken = business => {
  if (!business?._id) {
    throw new Error(
      "Business is required to create an authentication token."
    );
  }

  return generateToken({
    id: business._id,
    role: business.role || "business",
  });
};

export const sanitizeBusiness = business => {
  if (!business) {
    return null;
  }

  const source =
    typeof business.toObject === "function"
      ? business.toObject()
      : { ...business };

  delete source.password;

  return source;
};

export const authenticateBusiness = async (
  email,
  password
) => {
  const business =
    await findBusinessByEmail(email);

  if (!business) {
    return null;
  }

  if (business.isActive === false) {
    return null;
  }

  const validPassword =
    await comparePassword(
      password,
      business.password
    );

  if (!validPassword) {
    return null;
  }

  return business;
};