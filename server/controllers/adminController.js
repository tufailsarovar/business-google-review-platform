import Business from "../models/Business.js";
import Admin from "../models/Admin.js";
import ReviewTemplate from "../models/ReviewTemplate.js";
import PlatformSettings from "../models/PlatformSettings.js";
import { sendBusinessApprovalEmail } from "../services/emailService.js";

import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import GoogleBusiness from "../models/GoogleBusiness.js";

/* =========================================================
   HELPERS
========================================================= */

const getAdminId = (req) => req.user?.id || req.user?._id;

const getBusinessId = (req) =>
  req.params?.id || req.params?.businessId || req.body?.businessId;

const buildBusinessStats = (businesses) => {
  const total = businesses.length;

  const active = businesses.filter(
    (business) => business.isActive !== false && business.status !== "inactive",
  ).length;

  const inactive = total - active;

  return {
    total,
    active,
    inactive,
  };
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBusinesses,
      activeBusinesses,
      inactiveBusinesses,
      totalUsers,
      businesses,
    ] = await Promise.all([
      Business.countDocuments(),

      Business.countDocuments({
        isActive: {
          $ne: false,
        },
        status: {
          $ne: "inactive",
        },
      }),

      Business.countDocuments({
        $or: [
          {
            isActive: false,
          },
          {
            status: "inactive",
          },
        ],
      }),

      /*
       * There is currently no separate User model
       * in this project, so business accounts are
       * counted here as users.
       */
      Business.countDocuments(),

      Business.find({})
        .select(
          "businessId name businessName email phone category city state logo isActive status createdAt reviewStats",
        )
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean(),
    ]);

    let totalRatings = 0;
    let totalVisitors = 0;
    let weightedRatingTotal = 0;

    const businessData = businesses.map((business) => {
      const reviewStats = business?.reviewStats || {};

      const ratings = Number(reviewStats.totalRatings) || 0;

      const visitors = Number(reviewStats.totalVisitors) || 0;

      const oneStar = Number(reviewStats.oneStar) || 0;

      const twoStars = Number(reviewStats.twoStars) || 0;

      const threeStars = Number(reviewStats.threeStars) || 0;

      const fourStars = Number(reviewStats.fourStars) || 0;

      const fiveStars = Number(reviewStats.fiveStars) || 0;

      const weighted =
        oneStar * 1 +
        twoStars * 2 +
        threeStars * 3 +
        fourStars * 4 +
        fiveStars * 5;

      totalRatings += ratings;
      totalVisitors += visitors;
      weightedRatingTotal += weighted;

      const averageRating =
        ratings > 0 ? Number((weighted / ratings).toFixed(2)) : 0;

      return {
        _id: business._id,

        businessId: business.businessId,

        name: business.name,

        businessName: business.businessName,

        email: business.email,

        phone: business.phone,

        category: business.category,

        city: business.city,

        state: business.state,

        logo: business.logo,

        isActive: business.isActive !== false,

        status: business.status || "active",

        createdAt: business.createdAt,

        totalVisitors: visitors,

        totalRatings: ratings,

        oneStar,
        twoStars,
        threeStars,
        fourStars,
        fiveStars,

        averageRating,
      };
    });

    const averageRating =
      totalRatings > 0
        ? Number((weightedRatingTotal / totalRatings).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,

      stats: {
        totalBusinesses,
        activeBusinesses,
        inactiveBusinesses,
        totalUsers,
        totalRatings,
        totalVisitors,
        averageRating,

        businesses: businessData,

        recentBusinesses: businessData.slice(0, 10),

        ratingBusinesses: businessData
          .filter((business) => business.totalRatings > 0)
          .sort((a, b) => b.totalRatings - a.totalRatings)
          .slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET BUSINESSES
========================================================= */

export const getBusinesses = async (req, res, next) => {
  try {
    const { search = "", status = "all", page = 1, limit = 50 } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);

    const pageLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const filter = {};

    if (status === "active") {
      filter.isActive = {
        $ne: false,
      };

      filter.status = {
        $ne: "inactive",
      };
    }

    if (status === "inactive") {
      filter.$or = [
        {
          isActive: false,
        },
        {
          status: "inactive",
        },
      ];
    }

    if (String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim(), "i");

      filter.$and = [
        {
          $or: [
            {
              businessName: searchRegex,
            },
            {
              name: searchRegex,
            },
            {
              email: searchRegex,
            },
            {
              businessId: searchRegex,
            },
          ],
        },
      ];
    }

    const skip = (currentPage - 1) * pageLimit;

    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Business.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      businesses,

      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getBusinessById = async (req, res, next) => {
  try {
    const businessId = getBusinessId(req);

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business ID is required.",
      });
    }

    const business = await Business.findById(businessId)
      .select("-password")
      .lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    const googleBusiness = await GoogleBusiness.findOne({
      business: business._id,
    }).lean();

    const googleReviewUrl = googleBusiness?.reviewUrl || "";

    return res.status(200).json({
      success: true,
      business: {
        ...business,
        googleReviewUrl,
        googleUrl: googleReviewUrl,
        googleBusiness: googleBusiness || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE BUSINESS
========================================================= */

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

export const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const allowedFields = [
      "name",
      "businessName",
      "email",
      "phone",
      "category",
      "description",
      "address",
      "city",
      "state",
      "country",
      "website",
      "publicPageTitle",
      "publicPageDescription",
      "isActive",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    if (req.file) {
      business.logo = await uploadBusinessLogo(req.file);
    } else if (req.body.logo && !req.body.logo.startsWith("blob:")) {
      business.logo = req.body.logo;
    }

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business,
    });
  } catch (error) {
    console.error("Admin update business error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update business",
    });
  }
};

/* =========================================================
   ACTIVATE BUSINESS
========================================================= */

export const activateBusiness = async (req, res, next) => {
  try {
    const businessId = getBusinessId(req);

    const business = await Business.findByIdAndUpdate(
      businessId,
      {
        isActive: true,
        status: "active",
      },
      {
        new: true,
      },
    ).select("-password");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business activated successfully.",
      business,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DEACTIVATE BUSINESS
========================================================= */

export const deactivateBusiness = async (req, res, next) => {
  try {
    const businessId = getBusinessId(req);

    const business = await Business.findByIdAndUpdate(
      businessId,
      {
        isActive: false,
        status: "inactive",
      },
      {
        new: true,
      },
    ).select("-password");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business deactivated successfully.",
      business,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE BUSINESS
========================================================= */

export const deleteBusiness = async (req, res, next) => {
  try {
    const businessId = getBusinessId(req);

    const business = await Business.findByIdAndDelete(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET USERS
========================================================= */

export const getUsers = async (req, res, next) => {
  try {
    const users = await Business.find({})
      .select(
        "businessId name businessName email phone role isActive status createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await Business.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAllUsers = async (req, res, next) => {
  try {
    const result = await Business.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ADMIN PROFILE
========================================================= */

export const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = getAdminId(req);

    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   REVIEW TEMPLATES
========================================================= */

/*
 * GET
 * /api/admin/review-templates
 */

export const getReviewTemplates = async (req, res, next) => {
  try {
    const templates = await ReviewTemplate.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * GET SINGLE
 * /api/admin/review-templates/:id
 */

export const getReviewTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await ReviewTemplate.findById(id).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Review template not found.",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * POST
 * /api/admin/review-templates
 */

export const createReviewTemplate = async (req, res, next) => {
  try {
    const { title, description, template, rating, category, isActive } =
      req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template title is required.",
      });
    }

    if (!template?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review template content is required.",
      });
    }

    const numericRating = Number(rating);

    const finalRating =
      Number.isFinite(numericRating) && numericRating >= 1 && numericRating <= 5
        ? numericRating
        : 5;

    const reviewTemplate = await ReviewTemplate.create({
      title: title.trim(),

      description: description?.trim() || "",

      template: template.trim(),

      rating: finalRating,

      category: category?.trim() || "General",

      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Review template created successfully.",
      template: reviewTemplate,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PUT
 * /api/admin/review-templates/:id
 */

export const updateReviewTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "description",
      "template",
      "rating",
      "category",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.title !== undefined) {
      updates.title = String(updates.title).trim();

      if (!updates.title) {
        return res.status(400).json({
          success: false,
          message: "Template title is required.",
        });
      }
    }

    if (updates.description !== undefined) {
      updates.description = String(updates.description).trim();
    }

    if (updates.template !== undefined) {
      updates.template = String(updates.template).trim();

      if (!updates.template) {
        return res.status(400).json({
          success: false,
          message: "Review template content is required.",
        });
      }
    }

    if (updates.category !== undefined) {
      updates.category = String(updates.category).trim();
    }

    if (updates.rating !== undefined) {
      const numericRating = Number(updates.rating);

      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5.",
        });
      }

      updates.rating = numericRating;
    }

    const reviewTemplate = await ReviewTemplate.findByIdAndUpdate(
      id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!reviewTemplate) {
      return res.status(404).json({
        success: false,
        message: "Review template not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review template updated successfully.",
      template: reviewTemplate,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * DELETE
 * /api/admin/review-templates/:id
 */

export const deleteReviewTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviewTemplate = await ReviewTemplate.findByIdAndDelete(id);

    if (!reviewTemplate) {
      return res.status(404).json({
        success: false,
        message: "Review template not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review template deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

const DEFAULT_PLATFORM_SETTINGS = {
  platformName: "TapReview",
  supportEmail: "",
  supportPhone: "",
  contactAddress: "",
  websiteUrl: "",
  defaultCurrency: "INR",
  timezone: "Asia/Kolkata",
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  emailNotifications: true,
  paymentNotifications: true,
  ownerNotifications: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  smtpHost: "",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  smtpSecure: false,
};

const getOrCreatePlatformSettings = async () => {
  let settings = await PlatformSettings.findOne();

  if (!settings) {
    settings = await PlatformSettings.create(DEFAULT_PLATFORM_SETTINGS);
  }

  return settings;
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreatePlatformSettings();

    const safeSettings = settings.toObject();

    delete safeSettings.smtpPassword;

    return res.status(200).json({
      success: true,
      settings: safeSettings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreatePlatformSettings();

    const allowedFields = [
      "platformName",
      "supportEmail",
      "supportPhone",
      "contactAddress",
      "websiteUrl",
      "defaultCurrency",
      "timezone",
      "maintenanceMode",
      "allowRegistration",
      "requireEmailVerification",
      "emailNotifications",
      "paymentNotifications",
      "ownerNotifications",
      "sessionTimeout",
      "maxLoginAttempts",
      "smtpHost",
      "smtpPort",
      "smtpUsername",
      "smtpPassword",
      "smtpSecure",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === "string") {
          settings[field] = req.body[field].trim();
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    if (
      settings.platformName !== undefined &&
      !String(settings.platformName).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Platform name is required.",
      });
    }

    if (
      settings.supportEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid support email address.",
      });
    }

    const smtpPort = Number(settings.smtpPort);

    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      return res.status(400).json({
        success: false,
        message: "SMTP port must be between 1 and 65535.",
      });
    }

    const sessionTimeout = Number(settings.sessionTimeout);

    if (!Number.isInteger(sessionTimeout) || sessionTimeout < 5) {
      return res.status(400).json({
        success: false,
        message: "Session timeout must be at least 5 minutes.",
      });
    }

    const maxLoginAttempts = Number(settings.maxLoginAttempts);

    if (!Number.isInteger(maxLoginAttempts) || maxLoginAttempts < 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum login attempts must be at least 1.",
      });
    }

    await settings.save();

    const safeSettings = settings.toObject();

    delete safeSettings.smtpPassword;

    return res.status(200).json({
      success: true,
      message: "Platform settings updated successfully.",
      settings: safeSettings,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   REGISTRATION REQUESTS
   ========================================================= */

/*
 * GET
 * /api/admin/registration-requests
 *
 * Returns businesses waiting for admin approval.
 */
export const getRegistrationRequests = async (req, res, next) => {
  try {
    const requests = await Business.find({
      approvalStatus: "pending",
    })
      .select(
        "businessId name businessName email phone category description address city state country website createdAt approvalStatus isActive status",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * GET
 * /api/admin/registration-requests/:id
 *
 * Returns one pending registration request.
 */
export const getRegistrationRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await Business.findById(id).select("-password").lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Registration request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PATCH
 * /api/admin/registration-requests/:id/approve
 *
 * Approves the business and sends the Business ID
 * + login link to the registered email.
 */
export const approveRegistrationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Registration request not found.",
      });
    }

    if (business.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "This business has already been approved.",
      });
    }

    if (business.approvalStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "A rejected registration cannot be approved.",
      });
    }

    /*
     * Business ID should already exist from registration.
     * Generate a fallback only if an older pending
     * record does not have one.
     */
    if (!business.businessId) {
      const firstName = String(
        business.businessName || business.name || "Business",
      )
        .trim()
        .split(/\s+/)[0];

      const businessNamePart =
        firstName.replace(/[^a-zA-Z0-9]/g, "") || "Business";

      const randomCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      business.businessId = `${businessNamePart}-${randomCode}`;
    }

    business.approvalStatus = "approved";

    business.isActive = true;

    business.status = "active";

    await business.save();

    let emailSent = true;

    try {
      await sendBusinessApprovalEmail({
        email: business.email,
        name: business.name,
        businessName: business.businessName,
        businessId: business.businessId,
      });
    } catch (emailError) {
      emailSent = false;

      console.error("Business approval email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Business approved successfully. Approval email has been sent."
        : "Business approved successfully, but the approval email could not be sent.",
      emailSent,
      business: {
        _id: business._id,
        businessId: business.businessId,
        name: business.name,
        businessName: business.businessName,
        email: business.email,
        phone: business.phone,
        approvalStatus: business.approvalStatus,
        isActive: business.isActive,
        status: business.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PATCH
 * /api/admin/registration-requests/:id/reject
 *
 * Rejects a pending registration request.
 */
export const rejectRegistrationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Registration request not found.",
      });
    }

    if (business.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "An approved business cannot be rejected.",
      });
    }

    if (business.approvalStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "This registration has already been rejected.",
      });
    }

    business.approvalStatus = "rejected";

    business.isActive = false;

    business.status = "inactive";

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Registration request rejected successfully.",
      business: {
        _id: business._id,
        businessId: business.businessId,
        name: business.name,
        businessName: business.businessName,
        email: business.email,
        approvalStatus: business.approvalStatus,
        isActive: business.isActive,
        status: business.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
