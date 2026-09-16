import nodemailer from "nodemailer";

import {
  verificationEmail,
  forgotPasswordEmail,
  supportEmail,
} from "../templates/index.js";

const getEnv = name =>
  String(process.env[name] || "").trim();

const smtpPort =
  Number(
    process.env.SMTP_PORT
  ) || 587;

const smtpSecure =
  smtpPort === 465;

const smtpHost =
  getEnv("SMTP_HOST");

const smtpUser =
  getEnv("SMTP_USER");

const smtpPassword =
  getEnv("SMTP_PASSWORD");

const smtpFrom =
  getEnv("SMTP_FROM") ||
  smtpUser;

const supportEmailAddress =
  getEnv("SUPPORT_EMAIL") ||
  smtpUser;

const transporter =
  nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth:
      smtpUser && smtpPassword
        ? {
            user: smtpUser,
            pass: smtpPassword,
          }
        : undefined,
  });

const ensureMailerConfigured = () => {
  if (
    !smtpHost ||
    !smtpUser ||
    !smtpPassword
  ) {
    throw new Error(
      "SMTP configuration is incomplete."
    );
  }
};

const getClientUrl = () =>
  getEnv("CLIENT_URL") ||
  "http://localhost:5173";

export const sendVerificationEmail =
  async ({
    email,
    name,
    token,
  }) => {
    ensureMailerConfigured();

    if (!email || !token) {
      throw new Error(
        "Email and verification token are required."
      );
    }

    const verificationUrl =
      `${getClientUrl()}/verify-email/${encodeURIComponent(
        token
      )}`;

    const html =
      verificationEmail({
        name,
        verificationUrl,
      });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject:
        "Verify your TapRating account",
      html,
    });

    return true;
  };

export const sendForgotPasswordEmail =
  async ({
    email,
    name,
    token,
  }) => {
    ensureMailerConfigured();

    if (!email || !token) {
      throw new Error(
        "Email and reset token are required."
      );
    }

    const resetUrl =
      `${getClientUrl()}/reset-password/${encodeURIComponent(
        token
      )}`;

    const html =
      forgotPasswordEmail({
        name,
        resetUrl,
      });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject:
        "Reset your TapRating password",
      html,
    });

    return true;
  };

export const sendSupportEmail =
  async ({
    name,
    email,
    subject,
    message,
    business = null,
  }) => {
    ensureMailerConfigured();

    if (!name || !email || !message) {
      throw new Error(
        "Name, email and message are required."
      );
    }

    if (!supportEmailAddress) {
      throw new Error(
        "Support email is not configured."
      );
    }

    const html =
      supportEmail({
        name,
        email,
        subject,
        message,
        business,
      });

    await transporter.sendMail({
      from: smtpFrom,
      to: supportEmailAddress,
      replyTo: email,
      subject:
        subject ||
        "TapRating Support Request",
      html,
    });

    return true;
  };

export const verifyEmailTransport =
  async () => {
    ensureMailerConfigured();

    return transporter.verify();
  };

export default transporter;