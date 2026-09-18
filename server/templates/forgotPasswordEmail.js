const forgotPasswordEmail = ({
  name,
  resetUrl,
}) => {
  const displayName = name || "there";

  return {
    subject: "Reset Your TapReview Password",

    text: `
Hello ${displayName},

We received a request to reset the password for your TapReview account.

Reset your password using the link below:

${resetUrl}

This password reset link is temporary and will expire for security reasons.

If you did not request a password reset, you can safely ignore this email.

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
  <title>Reset Your TapReview Password</title>
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
    style="
      background:#f5f7fb;
      padding:40px 16px;
    "
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

          <!-- Header -->
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
                Business review management made simple
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;">

              <h2
                style="
                  margin:0 0 18px;
                  font-size:24px;
                  line-height:1.3;
                  color:#111827;
                "
              >
                Reset your password
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
                We received a request to reset the password
                associated with your TapReview account.
              </p>

              <div
                style="
                  text-align:center;
                  margin:32px 0;
                "
              >
                <a
                  href="${resetUrl}"
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
                  Reset Password
                </a>
              </div>

              <div
                style="
                  margin:28px 0;
                  padding:18px 20px;
                  background:#fff8e1;
                  border-radius:10px;
                  border:1px solid #ffe082;
                "
              >
                <p
                  style="
                    margin:0;
                    font-size:14px;
                    line-height:1.6;
                    color:#795548;
                  "
                >
                  For your security, this password reset link
                  is temporary and will expire automatically.
                </p>
              </div>

              <p
                style="
                  margin:24px 0 8px;
                  font-size:14px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                If the button does not work, copy and paste
                the following link into your browser:
              </p>

              <p
                style="
                  margin:0;
                  font-size:13px;
                  line-height:1.6;
                  word-break:break-all;
                  color:#1976d2;
                "
              >
                ${resetUrl}
              </p>

              <p
                style="
                  margin:28px 0 0;
                  font-size:14px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                If you did not request a password reset,
                you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
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

export default forgotPasswordEmail;