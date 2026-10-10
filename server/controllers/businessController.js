import Business from "../models/Business.js";
import GoogleBusiness from "../models/GoogleBusiness.js";
import generateBusinessId from "../utils/generateBusinessId.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const getUserId = (req) => req.user?.id || req.user?._id;

const getBusiness = async (userId) => Business.findById(userId);


export const getBusinessProfile = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const googleBusiness = await GoogleBusiness.findOne({
      business: business._id,
    });

    return res.status(200).json({
      success: true,
      business: {
        ...business.toObject(),
        googleReviewUrl:
          googleBusiness?.reviewUrl ||
          business.googleReviewUrl ||
          business.googleUrl ||
          "",
      },
      googleBusiness,
    });
  } catch (error) {
    next(error);
  }
};


const uploadBusinessLogo = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "taprating/business-logos",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });


export const updateBusinessProfile = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const fields = [
      "businessName",
      "category",
      "description",
      "address",
      "city",
      "state",
      "country",
      "website",
      "googleReviewUrl",
      "publicPageTitle",
      "publicPageDescription",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    if (req.body.ownerName !== undefined) {
      business.name = req.body.ownerName;
    } else if (req.body.name !== undefined) {
      business.name = req.body.name;
    }

    if (req.body.mobile !== undefined) {
      business.phone = req.body.mobile;
    } else if (req.body.phone !== undefined) {
      business.phone = req.body.phone;
    }

    if (req.file) {
      business.logo = await uploadBusinessLogo(req.file);
    } else {
      const suppliedLogo = req.body.logo || req.body.logoUrl;

      if (suppliedLogo && !suppliedLogo.startsWith("blob:")) {
        business.logo = suppliedLogo;
      }
    }

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
      "businessId businessName name category description address city state country website logo publicPageTitle publicPageDescription",
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

    const { publicPageTitle, publicPageDescription } = req.body;

    if (publicPageTitle !== undefined) {
      business.publicPageTitle = String(publicPageTitle).trim();
    }

    if (publicPageDescription !== undefined) {
      business.publicPageDescription = String(publicPageDescription).trim();
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

    // Accept the actual uploaded logo file.
    if (req.file) {
      business.logo = await uploadBusinessLogo(req.file);
    }

    // Keep frontend field names compatible with the database.
    if (req.body.businessName !== undefined) {
      business.businessName = req.body.businessName;
    }

    if (req.body.ownerName !== undefined) {
      business.name = req.body.ownerName;
    }

    if (req.body.mobile !== undefined) {
      business.phone = req.body.mobile;
    }

    if (req.body.logoUrl && !req.body.logoUrl.startsWith("blob:")) {
      business.logo = req.body.logoUrl;
    }

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

export const getBusinessSettings = async (req, res, next) => {
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
      settings: {
        publicPageEnabled: business.publicPageEnabled,
        aiSuggestionsEnabled: business.aiSuggestionsEnabled,
        notificationsEnabled: business.notificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessSettings = async (req, res, next) => {
  try {
    const business = await getBusiness(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const fields = [
      "publicPageEnabled",
      "aiSuggestionsEnabled",
      "notificationsEnabled",
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "boolean") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a boolean.`,
          });
        }

        business[field] = req.body[field];
      }
    }

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business settings saved successfully.",
      settings: {
        publicPageEnabled: business.publicPageEnabled,
        aiSuggestionsEnabled: business.aiSuggestionsEnabled,
        notificationsEnabled: business.notificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};
