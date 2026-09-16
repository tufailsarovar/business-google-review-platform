import GoogleBusiness from "../models/GoogleBusiness.js";

const normalizeUrl = value =>
  String(value || "").trim();

export const getGoogleBusiness =
  async businessId => {
    if (!businessId) {
      return null;
    }

    return GoogleBusiness.findOne({
      business: businessId,
    });
  };

export const getActiveGoogleBusiness =
  async businessId => {
    if (!businessId) {
      return null;
    }

    return GoogleBusiness.findOne({
      business: businessId,
      isActive: true,
    });
  };

export const saveGoogleReviewSettings =
  async ({
    businessId,
    reviewUrl,
    placeId = "",
    locationName = "",
  }) => {
    if (!businessId) {
      throw new Error(
        "Business ID is required."
      );
    }

    const normalizedReviewUrl =
      normalizeUrl(reviewUrl);

    if (!normalizedReviewUrl) {
      throw new Error(
        "Google review URL is required."
      );
    }

    try {
      const parsedUrl = new URL(
        normalizedReviewUrl
      );

      if (
        ![
          "http:",
          "https:",
        ].includes(parsedUrl.protocol)
      ) {
        throw new Error();
      }
    } catch {
      throw new Error(
        "Please provide a valid Google review URL."
      );
    }

    return GoogleBusiness.findOneAndUpdate(
      {
        business: businessId,
      },
      {
        business: businessId,
        reviewUrl:
          normalizedReviewUrl,
        placeId:
          String(placeId).trim(),
        locationName:
          String(locationName).trim(),
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  };

export const updateGoogleReviewUrl =
  async (
    businessId,
    reviewUrl
  ) => {
    if (!businessId) {
      throw new Error(
        "Business ID is required."
      );
    }

    const normalizedReviewUrl =
      normalizeUrl(reviewUrl);

    if (!normalizedReviewUrl) {
      throw new Error(
        "Google review URL is required."
      );
    }

    try {
      const parsedUrl = new URL(
        normalizedReviewUrl
      );

      if (
        ![
          "http:",
          "https:",
        ].includes(parsedUrl.protocol)
      ) {
        throw new Error();
      }
    } catch {
      throw new Error(
        "Please provide a valid Google review URL."
      );
    }

    return GoogleBusiness.findOneAndUpdate(
      {
        business: businessId,
      },
      {
        reviewUrl:
          normalizedReviewUrl,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  };

export const enableGoogleReview =
  async businessId => {
    if (!businessId) {
      throw new Error(
        "Business ID is required."
      );
    }

    const googleBusiness =
      await GoogleBusiness.findOne({
        business: businessId,
        reviewUrl: {
          $exists: true,
          $ne: "",
        },
      });

    if (!googleBusiness) {
      throw new Error(
        "Configure a Google review URL before enabling the Google review handoff."
      );
    }

    googleBusiness.isActive = true;

    await googleBusiness.save();

    return googleBusiness;
  };

export const disableGoogleReview =
  async businessId => {
    if (!businessId) {
      throw new Error(
        "Business ID is required."
      );
    }

    return GoogleBusiness.findOneAndUpdate(
      {
        business: businessId,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );
  };

export const getGoogleReviewUrl =
  async businessId => {
    const googleBusiness =
      await getActiveGoogleBusiness(
        businessId
      );

    if (
      !googleBusiness?.reviewUrl
    ) {
      return null;
    }

    return googleBusiness.reviewUrl;
  };

export const isValidGoogleReviewUrl =
  reviewUrl => {
    const value =
      normalizeUrl(reviewUrl);

    if (!value) {
      return false;
    }

    try {
      const parsedUrl =
        new URL(value);

      return [
        "http:",
        "https:",
      ].includes(
        parsedUrl.protocol
      );
    } catch {
      return false;
    }
  };