import Business from "../models/Business.js";
import {
  sendSupportEmail,
} from "../services/emailService.js";

export const sendSupportRequest = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    const normalizedName =
      String(name || "").trim();

    const normalizedEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const normalizedSubject =
      String(subject || "").trim();

    const normalizedMessage =
      String(message || "").trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedMessage
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and message are required.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    if (normalizedMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Message must be at least 10 characters long.",
      });
    }

    let business = null;

    const userId =
      req.user?.id || req.user?._id;

    if (userId) {
      business =
        await Business.findById(
          userId
        ).select(
          "businessId businessName name email"
        );
    }

    await sendSupportEmail({
      name: normalizedName,
      email: normalizedEmail,
      subject:
        normalizedSubject ||
        "TapReview Support Request",
      message: normalizedMessage,
      business,
    });

    return res.status(200).json({
      success: true,
      message:
        "Support request sent successfully. Our team will contact you soon.",
    });
  } catch (error) {
    next(error);
  }
};

export const contactAdmin = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    const normalizedName =
      String(name || "").trim();

    const normalizedEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const normalizedSubject =
      String(subject || "").trim();

    const normalizedMessage =
      String(message || "").trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedMessage
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and message are required.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    await sendSupportEmail({
      name: normalizedName,
      email: normalizedEmail,
      subject:
        normalizedSubject ||
        "Support Team",
      message: normalizedMessage,
    });

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent to the admin.",
    });
  } catch (error) {
    next(error);
  }
};