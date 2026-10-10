import Business from "../models/Business.js";
import GoogleBusiness from "../models/GoogleBusiness.js";

export const findBusinessById = async (id) => {
  if (!id) {
    return null;
  }

  return Business.findById(id);
};

export const findBusinessByBusinessId = async (businessId) => {
  if (!businessId) {
    return null;
  }

  return Business.findOne({
    businessId,
  });
};

export const findActiveBusinessByBusinessId = async (businessId) => {
  if (!businessId) {
    return null;
  }

  return Business.findOne({
    businessId,
    isActive: true,
    status: {
      $ne: "inactive",
    },
  });
};

export const getBusinessWithGoogleSettings = async (businessId) => {
  const business = await findActiveBusinessByBusinessId(businessId);

  if (!business) {
    return null;
  }

  const googleBusiness = await GoogleBusiness.findOne({
    business: business._id,
    isActive: true,
  });

  return {
    business,
    googleBusiness,
  };
};

export const updateBusiness = async (id, updates) => {
  if (!id) {
    throw new Error("Business ID is required.");
  }

  const allowedFields = [
    "name",
    "businessName",
    "phone",
    "category",
    "description",
    "address",
    "city",
    "state",
    "country",
    "website",
    "logo",
    "publicPageTitle",
    "publicPageDescription",
  ];

  const filteredUpdates = {};

  allowedFields.forEach((field) => {
    if (updates?.[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  return Business.findByIdAndUpdate(id, filteredUpdates, {
    new: true,
    runValidators: true,
  });
};

export const updateBusinessStatus = async (id, isActive) => {
  if (!id) {
    throw new Error("Business ID is required.");
  }

  return Business.findByIdAndUpdate(
    id,
    {
      isActive: Boolean(isActive),
      status: isActive ? "active" : "inactive",
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

export const incrementVisitors = async (businessId) => {
  if (!businessId) {
    return null;
  }

  return Business.findOneAndUpdate(
    {
      businessId,
      isActive: true,
    },
    {
      $inc: {
        "reviewStats.totalVisitors": 1,
      },
    },
    {
      new: true,
    },
  );
};

export const incrementRating = async (businessId, rating) => {
  if (!businessId) {
    return null;
  }

  const normalizedRating = Number(rating);

  if (
    !Number.isInteger(normalizedRating) ||
    normalizedRating < 1 ||
    normalizedRating > 5
  ) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const ratingField = {
    1: "oneStar",
    2: "twoStars",
    3: "threeStars",
    4: "fourStars",
    5: "fiveStars",
  }[normalizedRating];

  const business = await Business.findOneAndUpdate(
    {
      businessId,
      isActive: true,
    },
    {
      $inc: {
        "reviewStats.totalRatings": 1,
        [`reviewStats.${ratingField}`]: 1,
      },
    },
    {
      new: true,
    },
  );

  if (!business) {
    return null;
  }

  const stats = business.reviewStats || {};

  const totalRatings = Number(stats.totalRatings) || 0;

  const weightedTotal =
    (Number(stats.oneStar) || 0) * 1 +
    (Number(stats.twoStars) || 0) * 2 +
    (Number(stats.threeStars) || 0) * 3 +
    (Number(stats.fourStars) || 0) * 4 +
    (Number(stats.fiveStars) || 0) * 5;

  business.reviewStats.averageRating =
    totalRatings > 0 ? Number((weightedTotal / totalRatings).toFixed(2)) : 0;

  await business.save();

  return business;
};

export const getBusinessAnalytics = async (id) => {
  const business = await findBusinessById(id);

  if (!business) {
    return null;
  }

  const stats = business.reviewStats || {};

  return {
    totalVisitors: Number(stats.totalVisitors) || 0,

    totalRatings: Number(stats.totalRatings) || 0,

    oneStar: Number(stats.oneStar) || 0,

    twoStars: Number(stats.twoStars) || 0,

    threeStars: Number(stats.threeStars) || 0,

    fourStars: Number(stats.fourStars) || 0,

    fiveStars: Number(stats.fiveStars) || 0,

    averageRating: Number(stats.averageRating) || 0,
  };
};
