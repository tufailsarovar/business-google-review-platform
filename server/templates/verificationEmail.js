const verificationEmail = ({
  name,
  verificationUrl,
  otp,
}) => {
  const displayName = name || "there";

  return {
    subject: "Verify Your TapReview Account",
    text: `
Hello ${displayName},

Welcome to TapReview!

Please verify your email address to activate your account.

Verification link:
${verificationUrl}

${otp ? `Your verification OTP: ${otp}` : ""}

If you did not create this account, you can safely ignore this email.

Regards,
TapReview Team
    `.trim(),

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Verify Your TapReview Account</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
    color:#1f2937;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f5f7fb;padding:40px 16px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(0,0,0,0.08);
          "
        >

          <tr>
            <td
              style="
                background:#1976d2;
                padding:28px 30px;
                text-align:center;
              "
            >
              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:28px;
                  line-height:1.3;
                "
              >
                TapReview
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  color:#eaf3ff;
                  font-size:14px;
                "
              >
                Grow your business with better customer reviews
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;">

              <h2
                style="
                  margin:0 0 16px;
                  font-size:24px;
                  color:#111827;
                "
              >
                Verify your email
              </h2>

              <p
                style="
                  margin:0 0 16px;
                  font-size:16px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Hello <strong>${displayName}</strong>,
              </p>

              <p
                style="
                  margin:0 0 24px;
                  font-size:16px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Thanks for creating your TapReview account.
                Please verify your email address to continue.
              </p>

              <div style="text-align:center;margin:30px 0;">
                <a
                  href="${verificationUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#1976d2;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:bold;
                  "
                >
                  Verify Email
                </a>
              </div>

              ${
                otp
                  ? `
                  <div
                    style="
                      margin:28px 0;
                      padding:20px;
                      background:#f3f6fb;
                      border-radius:12px;
                      text-align:center;
                    "
                  >
                    <p
                      style="
                        margin:0 0 8px;
                        font-size:14px;
                        color:#6b7280;
                      "
                    >
                      Your verification OTP
                    </p>

                    <div
                      style="
                        font-size:30px;
                        font-weight:bold;
                        letter-spacing:8px;
                        color:#1976d2;
                      "
                    >
                      ${otp}
                    </div>
                  </div>
                  `
                  : ""
              }

              <p
                style="
                  margin:24px 0 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                If the button does not work, copy and paste this
                link into your browser:
              </p>

              <p
                style="
                  margin:8px 0 0;
                  font-size:13px;
                  line-height:1.6;
                  word-break:break-all;
                  color:#1976d2;
                "
              >
                ${verificationUrl}
              </p>

              <p
                style="
                  margin:28px 0 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                If you did not create a TapReview account,
                you can safely ignore this email.
              </p>

            </td>
          </tr>

          <tr>
            <td
              style="
                padding:22px 30px;
                background:#f8fafc;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:13px;
                  color:#6b7280;
                "
              >
                © ${new Date().getFullYear()} TapReview.
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
};

export default verificationEmail;