import rateLimit from "express-rate-limit";

const createRateLimiter = ({
  windowMs,
  max,
  message,
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message:
          message ||
          "Too many requests. Please try again later.",
      });
    },
  });

export const generalRateLimiter =
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message:
      "Too many requests from this IP. Please try again later.",
  });

export const authRateLimiter =
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message:
      "Too many authentication attempts. Please try again later.",
  });

export const reviewRateLimiter =
  createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 40,
    message:
      "Too many review requests. Please try again later.",
  });

export const supportRateLimiter =
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:
      "Too many support requests. Please try again later.",
  });

export default generalRateLimiter;