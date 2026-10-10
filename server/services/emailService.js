import nodemailer from "nodemailer";

import {
  verificationEmail,
  forgotPasswordEmail,
  supportEmail,
} from "../templates/index.js";

const getEnv = (name) => String(process.env[name] || "").trim();

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = smtpPort === 465;

const smtpHost = getEnv("SMTP_HOST");
const smtpUser = getEnv("SMTP_USER");
const smtpPassword = getEnv("SMTP_PASSWORD");
const smtpFrom = getEnv("SMTP_FROM") || smtpUser;
const supportEmailAddress = getEnv("SUPPORT_EMAIL") || smtpUser;

const transporter = nodemailer.createTransport({
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
  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error("SMTP configuration is incomplete.");
  }
};

const getClientUrl = () => getEnv("CLIENT_URL") || "http://localhost:5173";

/* =========================================================
   EMAIL OTP
   ========================================================= */

export const sendEmailOtp = async ({ email, otp }) => {
  ensureMailerConfigured();

  if (!email || !/^\d{6}$/.test(String(otp || ""))) {
    throw new Error("A valid email and six-digit OTP are required.");
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TapReview Email Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <div style="max-width:560px;margin:35px auto;padding:20px;">
          <div style="background:#ffffff;border-radius:18px;padding:35px 25px;box-shadow:0 8px 30px rgba(0,0,0,0.07);text-align:center;">
            <div style="font-size:25px;font-weight:800;color:#2563eb;margin-bottom:24px;">
              TapReview
            </div>

            <h1 style="font-size:25px;margin:0 0 14px;">
              Verify your email
            </h1>

            <p style="font-size:15px;line-height:1.7;color:#64748b;margin:0 0 25px;">
              Use the following one-time password to verify your email address.
              It expires in 5 minutes.
            </p>

            <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 30px;font-size:34px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">
              ${String(otp)}
            </div>

            <p style="font-size:13px;line-height:1.7;color:#64748b;margin:25px 0 0;">
              Never share this code with anyone. TapReview will never ask you
              to disclose your OTP.
            </p>

            <p style="font-size:12px;color:#94a3b8;margin-top:28px;">
              If you did not request this code, you can ignore this email.
            </p>
          </div>

          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px;">
            © ${new Date().getFullYear()} TapReview. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Your TapReview email verification code",
    text: `Your TapReview verification code is ${String(otp)}. It expires in 5 minutes. Do not share this code with anyone.`,
    html,
  });

  return true;
};



/* =========================================================
   REGISTRATION CONFIRMATION EMAIL
   ========================================================= */

export const sendRegistrationConfirmationEmail = async ({
  email,
  name,
  businessName,
  businessId,
}) => {
  ensureMailerConfigured();

  if (!email || !businessName || !businessId) {
    throw new Error(
      "Email, business name and Business ID are required.",
    );
  }

  const safeName = String(name || "Business Owner").trim();
  const safeBusinessName = String(businessName).trim();
  const safeBusinessId = String(businessId).trim();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TapReview Registration Confirmation</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <div style="max-width:600px;margin:35px auto;padding:20px;">
          <div style="background:#ffffff;border-radius:18px;padding:35px 28px;box-shadow:0 8px 30px rgba(0,0,0,0.07);">
            <div style="text-align:center;margin-bottom:25px;">
              <span style="font-size:27px;font-weight:800;color:#2563eb;">
                TapReview
              </span>
            </div>

            <h1 style="font-size:25px;text-align:center;margin:0 0 20px;">
              Registration Received!
            </h1>

            <p style="font-size:15px;line-height:1.8;color:#475569;">
              Hello ${safeName},
            </p>

            <p style="font-size:15px;line-height:1.8;color:#475569;">
              Thank you for registering
              <strong>${safeBusinessName}</strong> with TapReview.
              We have successfully received your business registration request.
            </p>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#9a3412;">
                Your account is awaiting admin approval.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#7c2d12;">
                Our team will review your registration. You can access your
                business dashboard after your account has been approved.
              </p>
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">
                Business ID
              </p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#2563eb;word-break:break-word;">
                ${safeBusinessId}
              </p>
            </div>

            <p style="font-size:14px;line-height:1.8;color:#475569;">
              We will notify you by email when your registration status changes.
              Please keep this email for your records.
            </p>

            <p style="font-size:13px;line-height:1.7;color:#94a3b8;margin-top:28px;">
              If you did not submit this registration request, please contact
              TapReview support.
            </p>
          </div>

          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px;">
            © ${new Date().getFullYear()} TapReview. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "TapReview registration received — pending approval",
    text: [
      `Hello ${safeName},`,
      "",
      `We received your registration for ${safeBusinessName}.`,
      "Your account is awaiting admin approval.",
      `Business ID: ${safeBusinessId}`,
      "",
      "We will notify you by email when your registration status changes.",
    ].join("\n"),
    html,
  });

  return true;
};

/* =========================================================
   APPROVAL EMAIL
   ========================================================= */

export const sendBusinessApprovalEmail = async ({
  email,
  name,
  businessName,
  businessId,
}) => {
  ensureMailerConfigured();

  if (!email || !businessId || !businessName) {
    throw new Error("Email, business name and Business ID are required.");
  }

  const loginUrl = `${getClientUrl()}/login`;
  const safeName = String(name || "Business Owner").trim();
  const safeBusinessName = String(businessName).trim();
  const safeBusinessId = String(businessId).trim();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TapReview Account Approved</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
        <div style="max-width:620px;margin:40px auto;padding:20px;">
          <div style="background:#ffffff;border-radius:20px;padding:40px 32px;box-shadow:0 8px 30px rgba(0,0,0,0.08);">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="display:inline-block;padding:10px 18px;border-radius:12px;background:#eef4ff;color:#2563eb;font-size:22px;font-weight:800;">
                TapReview
              </div>
            </div>

            <h1 style="margin:0 0 12px;font-size:28px;line-height:1.3;text-align:center;">
              Your account has been approved 🎉
            </h1>

            <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#5b6475;">
              Hello ${safeName},
            </p>

            <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#5b6475;">
              Your business registration request for
              <strong>${safeBusinessName}</strong>
              has been approved by the TapReview admin team.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:25px 0;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">
                Your Business ID
              </p>
              <div style="font-size:26px;font-weight:800;color:#2563eb;letter-spacing:1px;word-break:break-word;">
                ${safeBusinessId}
              </div>
            </div>

            <p style="font-size:15px;line-height:1.7;color:#5b6475;margin:0 0 25px;">
              You can now access your TapReview business dashboard using
              your verified email address.
            </p>

            <div style="text-align:center;margin:30px 0;">
              <a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:16px;font-weight:700;">
                Login to TapReview
              </a>
            </div>

            <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:28px 0 0;text-align:center;">
              If you did not submit this registration request, please contact TapReview support.
            </p>
          </div>

          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
            © ${new Date().getFullYear()} TapReview. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Your TapReview business account has been approved",
    html,
  });

  return true;
};

/* =========================================================
   VERIFICATION EMAIL
   ========================================================= */

export const sendVerificationEmail = async ({ email, name, token }) => {
  ensureMailerConfigured();

  if (!email || !token) {
    throw new Error("Email and verification token are required.");
  }

  const verificationUrl = `${getClientUrl()}/verify-email/${encodeURIComponent(
    token,
  )}`;

  const html = verificationEmail({
    name,
    verificationUrl,
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Verify your TapReview account",
    html,
  });

  return true;
};

/* =========================================================
   FORGOT PASSWORD EMAIL
   ========================================================= */

export const sendForgotPasswordEmail = async ({ email, name, token }) => {
  ensureMailerConfigured();

  if (!email || !token) {
    throw new Error("Email and reset token are required.");
  }

  const resetUrl = `${getClientUrl()}/reset-password/${encodeURIComponent(
    token,
  )}`;

  const html = forgotPasswordEmail({
    name,
    resetUrl,
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Reset your TapReview password",
    html,
  });

  return true;
};

/* =========================================================
   SUPPORT EMAIL
   ========================================================= */

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
  business = null,
}) => {
  ensureMailerConfigured();

  if (!name || !email || !message) {
    throw new Error("Name, email and message are required.");
  }

  if (!supportEmailAddress) {
    throw new Error("Support email is not configured.");
  }

  const html = supportEmail({
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
    subject: subject || "TapReview Support Request",
    html,
  });

  return true;
};

/* =========================================================
   VERIFY SMTP
   ========================================================= */

export const verifyEmailTransport = async () => {
  ensureMailerConfigured();
  return transporter.verify();
};

export default transporter;
