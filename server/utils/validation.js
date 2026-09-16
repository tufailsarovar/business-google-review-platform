import validator from "validator";

export const validateEmail = email => {
  return (
    typeof email === "string" &&
    validator.isEmail(email.trim())
  );
};

export const validatePassword = password => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export const validateName = name => {
  return (
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 100
  );
};

export const validatePhone = phone => {
  if (typeof phone !== "string") {
    return false;
  }

  const normalizedPhone = phone.replace(/\s+/g, "");

  return validator.isMobilePhone(
    normalizedPhone,
    "any",
    {
      strictMode: false,
    }
  );
};

export const validateRating = rating => {
  const numericRating = Number(rating);

  return (
    Number.isInteger(numericRating) &&
    numericRating >= 1 &&
    numericRating <= 5
  );
};

export const validateUrl = url => {
  return (
    typeof url === "string" &&
    validator.isURL(url.trim(), {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  );
};

export const sanitizeString = value => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
};

export const isValidObjectId = value => {
  return (
    typeof value === "string" &&
    /^[a-f\d]{24}$/i.test(value)
  );
};

export const validateBusinessData = data => {
  const errors = {};

  if (!validateName(data?.businessName)) {
    errors.businessName =
      "Business name must be between 2 and 100 characters.";
  }

  if (data?.email && !validateEmail(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (data?.phone && !validatePhone(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (data?.website && !validateUrl(data.website)) {
    errors.website = "Please enter a valid website URL.";
  }

  if (data?.googleReviewUrl && !validateUrl(data.googleReviewUrl)) {
    errors.googleReviewUrl =
      "Please enter a valid Google review URL.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRating,
  validateUrl,
  sanitizeString,
  isValidObjectId,
  validateBusinessData,
};