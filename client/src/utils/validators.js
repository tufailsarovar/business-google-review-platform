export const isEmail = value =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

export const isRequired = value =>
  String(value ?? "").trim().length > 0;

export const required = isRequired;

export const isValidMobile = value =>
  /^[6-9]\d{9}$/.test(String(value || "").replace(/\D/g, ""));

export const isValidPassword = value =>
  typeof value === "string" && value.length >= 8;

export const isValidRating = value => {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

export const isValidUrl = value => {
  try {
    const url = new URL(String(value || "").trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const isValidGoogleUrl = value => {
  try {
    const url = new URL(String(value || "").trim());

    return (
      ["http:", "https:"].includes(url.protocol) &&
      /(^|\.)google\.[a-z.]+$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
};

export const passwordsMatch = (password, confirmPassword) =>
  String(password || "") === String(confirmPassword || "");

export const normalizeEmail = value =>
  String(value || "").trim().toLowerCase();

export const validateSignup = form => {
  const errors = {};

  if (!isRequired(form.businessName)) {
    errors.businessName = "Business name is required.";
  }

  if (!isRequired(form.ownerName)) {
    errors.ownerName = "Owner name is required.";
  }

  if (!isEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (form.mobile && !isValidMobile(form.mobile)) {
    errors.mobile = "Enter a valid 10-digit mobile number.";
  }

  if (!isValidPassword(form.password)) {
    errors.password = "Password must contain at least 8 characters.";
  }

  if (!passwordsMatch(form.password, form.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

export const validateLogin = form => {
  const errors = {};

  if (!isEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!isRequired(form.password)) {
    errors.password = "Password is required.";
  }

  return errors;
};