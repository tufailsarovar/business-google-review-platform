const supportEmail = ({
  name,
  email,
  subject,
  message,
  businessName,
  phone,
}) => {
  const safeName = name || "Not provided";
  const safeEmail = email || "Not provided";
  const safeSubject = subject || "TapReview Support Request";
  const safeMessage = message || "No message provided";
  const safeBusinessName = businessName || "Not provided";
  const safePhone = phone || "Not provided";

  return {
    subject: `TapReview Support: ${safeSubject}`,

    text: `
New support request received from TapReview.

Name: ${safeName}
Email: ${safeEmail}
Business Name: ${safeBusinessName}
Phone: ${safePhone}
Subject: ${safeSubject}

Message:
${safeMessage}

Regards,
TapReview Support System
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
  <title>TapReview Support Request</title>
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
            max-width:650px;
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
                New Support Request
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 32px;">

              <h2
                style="
                  margin:0 0 24px;
                  font-size:23px;
                  color:#111827;
                "
              >
                Customer Support Request
              </h2>

              <!-- Customer Details -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-bottom:28px;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding:13px 16px;
                      background:#f8fafc;
                      font-weight:bold;
                      width:38%;
                      color:#374151;
                    "
                  >
                    Name
                  </td>

                  <td
                    style="
                      padding:13px 16px;
                      color:#4b5563;
                    "
                  >
                    ${safeName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:13px 16px;
                      background:#f8fafc;
                      font-weight:bold;
                      color:#374151;
                    "
                  >
                    Email
                  </td>

                  <td
                    style="
                      padding:13px 16px;
                      color:#4b5563;
                      word-break:break-word;
                    "
                  >
                    ${safeEmail}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:13px 16px;
                      background:#f8fafc;
                      font-weight:bold;
                      color:#374151;
                    "
                  >
                    Business Name
                  </td>

                  <td
                    style="
                      padding:13px 16px;
                      color:#4b5563;
                    "
                  >
                    ${safeBusinessName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:13px 16px;
                      background:#f8fafc;
                      font-weight:bold;
                      color:#374151;
                    "
                  >
                    Phone
                  </td>

                  <td
                    style="
                      padding:13px 16px;
                      color:#4b5563;
                    "
                  >
                    ${safePhone}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:13px 16px;
                      background:#f8fafc;
                      font-weight:bold;
                      color:#374151;
                    "
                  >
                    Subject
                  </td>

                  <td
                    style="
                      padding:13px 16px;
                      color:#4b5563;
                    "
                  >
                    ${safeSubject}
                  </td>
                </tr>

              </table>

              <!-- Message -->
              <h3
                style="
                  margin:0 0 12px;
                  font-size:18px;
                  color:#111827;
                "
              >
                Message
              </h3>

              <div
                style="
                  padding:20px;
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  font-size:15px;
                  line-height:1.7;
                  color:#4b5563;
                  white-space:pre-wrap;
                  word-break:break-word;
                "
              >
                ${safeMessage}
              </div>

              <p
                style="
                  margin:28px 0 0;
                  font-size:13px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                This email was automatically generated by
                the TapReview support system.
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

export default supportEmail;