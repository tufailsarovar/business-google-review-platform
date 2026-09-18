import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { loadEnv } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import apiLimiter from "./middleware/rateLimitMiddleware.js";

dotenv.config();

loadEnv();

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TapReview API is running.",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TapReview API is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/admin/test-route", (req, res) => {
  res.json({
    success: true,
    message: "Admin route is working",
  });
});
app.use("/api/support", supportRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `TapReview server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start TapReview server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();