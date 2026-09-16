import Business from "../models/Business.js";
import GoogleBusiness from "../models/GoogleBusiness.js";

const getUserId = req =>
  req.user?.id || req.user?._id;

const normalizeUrl = value =>
  String(value || "").trim();

export const getGoogleSettings = async (
  req,
  res,
  next
) => {
  try {
    const businessId = getUserId(req);

    const business =
      await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const googleBusiness =
      await GoogleBusiness.findOne({
        business: business._id,
      });

    return res.status(200).json({
      success: true,
      googleBusiness,
    });
  } catch (error) {
    next(error);
  }
};

export const saveGoogleSettings = async (
  req,
  res,
  next
) => {
  try {
    const businessId = getUserId(req);

    const business =
      await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const {
      reviewUrl,
      placeId,
      locationName,
    } = req.body;

    const normalizedReviewUrl =
      normalizeUrl(reviewUrl);

    if (!normalizedReviewUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Google review URL is required.",
      });
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
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid Google review URL.",
        });
      }
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid Google review URL.",
      });
    }

    const googleBusiness =
      await GoogleBusiness.findOneAndUpdate(
        {
          business: business._id,
        },
        {
          business: business._id,
          reviewUrl:
            normalizedReviewUrl,
          placeId:
            String(placeId || "").trim(),
          locationName:
            String(
              locationName || ""
            ).trim(),
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Google review settings saved successfully.",
      googleBusiness,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoogleReviewUrl =
  async (req, res, next) => {
    try {
      const businessId = getUserId(req);

      const business =
        await Business.findById(
          businessId
        );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business not found.",
        });
      }

      const reviewUrl =
        normalizeUrl(
          req.body.reviewUrl
        );

      if (!reviewUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Google review URL is required.",
        });
      }

      try {
        const parsedUrl = new URL(
          reviewUrl
        );

        if (
          ![
            "http:",
            "https:",
          ].includes(
            parsedUrl.protocol
          )
        ) {
          throw new Error();
        }
      } catch {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid review URL.",
        });
      }

      const googleBusiness =
        await GoogleBusiness.findOneAndUpdate(
          {
            business: business._id,
          },
          {
            reviewUrl,
            isActive: true,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Google review URL updated successfully.",
        googleBusiness,
      });
    } catch (error) {
      next(error);
    }
  };

export const getPublicGoogleReviewUrl =
  async (req, res, next) => {
    try {
      const { businessId } =
        req.params;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message:
            "Business ID is required.",
        });
      }

      const business =
        await Business.findOne({
          businessId,
          isActive: true,
        });

      if (!business) {
        return res.status(404).json({
          success: false,
          message:
            "Business not found or inactive.",
        });
      }

      const googleBusiness =
        await GoogleBusiness.findOne({
          business: business._id,
          isActive: true,
        }).select(
          "reviewUrl placeId locationName"
        );

      if (!googleBusiness) {
        return res.status(404).json({
          success: false,
          message:
            "Google review settings are not configured.",
        });
      }

      return res.status(200).json({
        success: true,
        reviewUrl:
          googleBusiness.reviewUrl,
        placeId:
          googleBusiness.placeId || "",
        locationName:
          googleBusiness.locationName ||
          "",
      });
    } catch (error) {
      next(error);
    }
  };

export const disableGoogleReview =
  async (req, res, next) => {
    try {
      const businessId = getUserId(req);

      const business =
        await Business.findById(
          businessId
        );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business not found.",
        });
      }

      const googleBusiness =
        await GoogleBusiness.findOneAndUpdate(
          {
            business: business._id,
          },
          {
            isActive: false,
          },
          {
            new: true,
          }
        );

      if (!googleBusiness) {
        return res.status(404).json({
          success: false,
          message:
            "Google review settings not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Google review handoff disabled.",
        googleBusiness,
      });
    } catch (error) {
      next(error);
    }
  };

export const enableGoogleReview =
  async (req, res, next) => {
    try {
      const businessId = getUserId(req);

      const business =
        await Business.findById(
          businessId
        );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business not found.",
        });
      }

      const googleBusiness =
        await GoogleBusiness.findOneAndUpdate(
          {
            business: business._id,
            reviewUrl: {
              $exists: true,
              $ne: "",
            },
          },
          {
            isActive: true,
          },
          {
            new: true,
          }
        );

      if (!googleBusiness) {
        return res.status(404).json({
          success: false,
          message:
            "Configure a Google review URL before enabling the Google review handoff.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Google review handoff enabled.",
        googleBusiness,
      });
    } catch (error) {
      next(error);
    }
  };