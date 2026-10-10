import Business from "../models/Business.js";
import ReviewTemplate from "../models/ReviewTemplate.js";

import { generateReviewSuggestion } from "../services/openaiService.js";

import { generateGeminiReviewSuggestion } from "../services/geminiService.js";
import PlatformSettings from "../models/PlatformSettings.js";

const getUserId = (req) => req.user?.id || req.user?._id;

const normalizeRating = (value) => {
  const rating = Number(value);

  if (!Number.isInteger(rating)) {
    return null;
  }

  if (rating < 1 || rating > 5) {
    return null;
  }

  return rating;
};

const getBusinessByPublicId = async (businessId) =>
  Business.findOne({
    businessId,
    isActive: true,
  });

/* =========================================================
   GENERATE REVIEW
   ========================================================= */

export const generateReview = async (req, res, next) => {
  try {
    const { businessId, rating, keywords = [], customerName = "" } = req.body;

    const normalizedRating = normalizeRating(rating);

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    if (!normalizedRating) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const business = await getBusinessByPublicId(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or inactive.",
      });
    }

    if (business.aiSuggestionsEnabled === false) {
      return res.status(403).json({
        success: false,
        message: "AI review suggestions are disabled for this business.",
      });
    }

    const platformSettings = await PlatformSettings.findOne();

    if (platformSettings?.allowReviewGeneration === false) {
      return res.status(403).json({
        success: false,
        message: "AI review generation is currently disabled.",
      });
    }
    /*
     * Find an active admin-created template
     * matching the customer's rating.
     */
    const reviewTemplate = await ReviewTemplate.findOne({
      rating: normalizedRating,
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    const review = await generateReviewSuggestion({
      businessName: business.businessName || business.name,

      category: business.category || "",

      description: business.description || "",

      rating: normalizedRating,

      keywords: Array.isArray(keywords) ? keywords : [],

      customerName: String(customerName).trim(),

      reviewTemplate: reviewTemplate?.template || "",
    });

    return res.status(200).json({
      success: true,
      review,

      /*
       * Useful for the frontend to know whether
       * an admin template was used.
       */
      templateUsed: Boolean(reviewTemplate),

      template: reviewTemplate
        ? {
            id: reviewTemplate._id,
            title: reviewTemplate.title,
            rating: reviewTemplate.rating,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GENERATE REVIEW WITH GEMINI
   ========================================================= */

export const generateGeminiReview = async (req, res, next) => {
  try {
    const { businessId, rating, keywords = [], customerName = "" } = req.body;

    const normalizedRating = normalizeRating(rating);

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    if (!normalizedRating) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const business = await getBusinessByPublicId(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or inactive.",
      });
    }

    const reviewTemplate = await ReviewTemplate.findOne({
      rating: normalizedRating,
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    const review = await generateGeminiReviewSuggestion({
      businessName: business.businessName || business.name,

      category: business.category || "",

      description: business.description || "",

      rating: normalizedRating,

      keywords: Array.isArray(keywords) ? keywords : [],

      customerName: String(customerName).trim(),

      reviewTemplate: reviewTemplate?.template || "",
    });

    return res.status(200).json({
      success: true,
      review,

      provider: "gemini",

      templateUsed: Boolean(reviewTemplate),

      template: reviewTemplate
        ? {
            id: reviewTemplate._id,
            title: reviewTemplate.title,
            rating: reviewTemplate.rating,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};
/* =========================================================
   GET REVIEW STATS
   ========================================================= */

export const getReviewStats = async (req, res, next) => {
  try {
    const business = await Business.findById(getUserId(req));

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const stats = business.reviewStats || {};

    return res.status(200).json({
      success: true,

      stats: {
        totalVisitors: Number(stats.totalVisitors) || 0,

        totalRatings: Number(stats.totalRatings) || 0,

        oneStar: Number(stats.oneStar) || 0,

        twoStars: Number(stats.twoStars) || 0,

        threeStars: Number(stats.threeStars) || 0,

        fourStars: Number(stats.fourStars) || 0,

        fiveStars: Number(stats.fiveStars) || 0,

        averageRating: Number(stats.averageRating) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RECORD RATING
   ========================================================= */

export const recordRating = async (req, res, next) => {
  try {
    const { businessId, rating } = req.body;

    const normalizedRating = normalizeRating(rating);

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    if (!normalizedRating) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    /*
     * IMPORTANT:
     * The Business schema uses:
     *
     * oneStar
     * twoStars
     * threeStars
     * fourStars
     * fiveStars
     */

    const ratingFieldMap = {
      1: "reviewStats.oneStar",
      2: "reviewStats.twoStars",
      3: "reviewStats.threeStars",
      4: "reviewStats.fourStars",
      5: "reviewStats.fiveStars",
    };

    const ratingField = ratingFieldMap[normalizedRating];

    const business = await Business.findOneAndUpdate(
      {
        businessId,
        isActive: true,
      },

      {
        $inc: {
          "reviewStats.totalRatings": 1,
          [ratingField]: 1,
        },
      },

      {
        new: true,
      },
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or inactive.",
      });
    }

    const stats = business.reviewStats || {};

    const totalRatings = Number(stats.totalRatings) || 0;

    const oneStar = Number(stats.oneStar) || 0;

    const twoStars = Number(stats.twoStars) || 0;

    const threeStars = Number(stats.threeStars) || 0;

    const fourStars = Number(stats.fourStars) || 0;

    const fiveStars = Number(stats.fiveStars) || 0;

    const weightedTotal =
      oneStar * 1 +
      twoStars * 2 +
      threeStars * 3 +
      fourStars * 4 +
      fiveStars * 5;

    business.reviewStats.averageRating =
      totalRatings > 0 ? Number((weightedTotal / totalRatings).toFixed(2)) : 0;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Rating recorded.",
      stats: {
        totalRatings,
        oneStar,
        twoStars,
        threeStars,
        fourStars,
        fiveStars,
        averageRating: business.reviewStats.averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RECORD VISITOR
   ========================================================= */

export const recordVisitor = async (req, res, next) => {
  try {
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    const business = await Business.findOneAndUpdate(
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

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found or inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visitor recorded.",
    });
  } catch (error) {
    next(error);
  }
};
