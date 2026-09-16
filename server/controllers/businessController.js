import Business from "../models/Business.js";
import GoogleBusiness from "../models/GoogleBusiness.js";
import generateBusinessId from "../utils/generateBusinessId.js";

const getUserId = req => req.user?.id || req.user?._id;

const getBusiness = async userId => Business.findById(userId);

export const getBusinessProfile = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessProfile = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
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

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business profile updated successfully.",
      business,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicBusiness = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    const business = await Business.findOne({
      businessId,
      isActive: true,
    }).select(
      "businessId businessName name category description address city state country website logo publicPageTitle publicPageDescription"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or inactive.",
      });
    }

    const googleBusiness = await GoogleBusiness.findOne({
      business: business._id,
      isActive: true,
    }).select("reviewUrl placeId locationName");

    return res.status(200).json({
      success: true,
      business,
      googleBusiness,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePublicPage = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const {
      publicPageTitle,
      publicPageDescription,
    } = req.body;

    if (publicPageTitle !== undefined) {
      business.publicPageTitle = String(publicPageTitle).trim();
    }

    if (publicPageDescription !== undefined) {
      business.publicPageDescription =
        String(publicPageDescription).trim();
    }

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Public page settings updated successfully.",
      business,
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessAnalytics = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const reviewStats = business.reviewStats || {};

    return res.status(200).json({
      success: true,
      analytics: {
        totalVisitors: Number(reviewStats.totalVisitors) || 0,
        totalRatings: Number(reviewStats.totalRatings) || 0,
        oneStar: Number(reviewStats.oneStar) || 0,
        twoStars: Number(reviewStats.twoStars) || 0,
        threeStars: Number(reviewStats.threeStars) || 0,
        fourStars: Number(reviewStats.fourStars) || 0,
        fiveStars: Number(reviewStats.fiveStars) || 0,
        averageRating: Number(reviewStats.averageRating) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateBusinessId = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    let businessId;

    do {
      businessId = await generateBusinessId();
    } while (
      await Business.exists({
        businessId,
        _id: {
          $ne: business._id,
        },
      })
    );

    business.businessId = businessId;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business public ID regenerated successfully.",
      businessId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessStatus = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean.",
      });
    }

    business.isActive = req.body.isActive;

    await business.save();

    return res.status(200).json({
      success: true,
      message: business.isActive
        ? "Business activated successfully."
        : "Business deactivated successfully.",
      business,
    });
  } catch (error) {
    next(error);
  }
};