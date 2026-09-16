import nodemailer from "nodemailer";

import {
  verificationEmail,
  forgotPasswordEmail,
  supportEmail,
} from "../templates/index.js";

const getEnv = (name) =>
  String(process.env[name] || "").trim();

const smtpPort =
  Number(process.env.SMTP_PORT) || 587;

const smtpSecure = smtpPort === 465;

const smtpHost = getEnv("SMTP_HOST");
const smtpUser = getEnv("SMTP_USER");
const smtpPassword = getEnv("SMTP_PASSWORD");

const smtpFrom =
  getEnv("SMTP_FROM") || smtpUser;

const supportEmailAddress =
  getEnv("SUPPORT_EMAIL") || smtpUser;

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

/* =========================================================
   APPROVAL EMAIL
   ========================================================= */

export const sendBusinessApprovalEmail =
  async ({
    email,
    name,
    businessName,
    businessId,
  }) => {
    ensureMailerConfigured();

    if (
      !email ||
      !businessId ||
      !businessName
    ) {
      throw new Error(
        "Email, business name and Business ID are required."
      );
    }

    const loginUrl =
      `${getClientUrl()}/login`;

    const safeName =
      String(name || "Business Owner")
        .trim();

    const safeBusinessName =
      String(businessName)
        .trim();

    const safeBusinessId =
      String(businessId)
        .trim();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TapRating Account Approved</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f7fb;
            font-family:Arial,Helvetica,sans-serif;
            color:#172033;
          "
        >
          <div
            style="
              max-width:620px;
              margin:40px auto;
              padding:20px;
            "
          >
            <div
              style="
                background:#ffffff;
                border-radius:20px;
                padding:40px 32px;
                box-shadow:0 8px 30px rgba(0,0,0,0.08);
              "
            >

              <div
                style="
                  text-align:center;
                  margin-bottom:28px;
                "
              >
                <div
                  style="
                    display:inline-block;
                    padding:10px 18px;
                    border-radius:12px;
                    background:#eef4ff;
                    color:#2563eb;
                    font-size:22px;
                    font-weight:800;
                  "
                >
                  TapRating
                </div>
              </div>

              <h1
                style="
                  margin:0 0 12px;
                  font-size:28px;
                  line-height:1.3;
                  text-align:center;
                "
              >
                Your account has been approved 🎉
              </h1>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px;
                  color:#5b6475;
                "
              >
                Hello ${safeName},
              </p>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px;
                  color:#5b6475;
                "
              >
                Your business registration request for
                <strong>${safeBusinessName}</strong>
                has been approved by the TapRating admin team.
              </p>

              <div
                style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:16px;
                  padding:24px;
                  margin:25px 0;
                "
              >
                <p
                  style="
                    margin:0 0 8px;
                    font-size:13px;
                    color:#64748b;
                    text-transform:uppercase;
                    letter-spacing:0.5px;
                    font-weight:700;
                  "
                >
                  Your Business ID
                </p>

                <div
                  style="
                    font-size:26px;
                    font-weight:800;
                    color:#2563eb;
                    letter-spacing:1px;
                    word-break:break-word;
                  "
                >
                  ${safeBusinessId}
                </div>
              </div>

              <p
                style="
                  font-size:15px;
                  line-height:1.7;
                  color:#5b6475;
                  margin:0 0 25px;
                "
              >
                You can now access your TapRating business dashboard
                using the email address and password you provided
                during registration.
              </p>

              <div
                style="
                  text-align:center;
                  margin:30px 0;
                "
              >
                <a
                  href="${loginUrl}"
                  style="
                    display:inline-block;
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:700;
                  "
                >
                  Login to TapRating
                </a>
              </div>

              <p
                style="
                  font-size:13px;
                  line-height:1.6;
                  color:#94a3b8;
                  margin:28px 0 0;
                  text-align:center;
                "
              >
                If you did not submit this registration request,
                please contact TapRating support.
              </p>

            </div>

            <p
              style="
                text-align:center;
                color:#94a3b8;
                font-size:12px;
                margin-top:20px;
              "
            >
              © ${new Date().getFullYear()} TapRating. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject:
        "Your TapRating business account has been approved",
      html,
    });

    return true;
  };

/* =========================================================
   VERIFICATION EMAIL
   ========================================================= */

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

/* =========================================================
   FORGOT PASSWORD EMAIL
   ========================================================= */

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

/* =========================================================
   SUPPORT EMAIL
   ========================================================= */

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

/* =========================================================
   VERIFY SMTP
   ========================================================= */

export const verifyEmailTransport =
  async () => {
    ensureMailerConfigured();

    return transporter.verify();
  };

export default transporter;