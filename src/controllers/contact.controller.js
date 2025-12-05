import { sendBrevoMail } from "../utils/brevo/config.brevo.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import dotenv from "dotenv";
dotenv.config();

export const contactMe = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  await sendBrevoMail({
    to: process.env.FROM_EMAIL,
    subject: "New Contact Message",
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f7f7f8; padding:40px 0;">
  <table align="center" width="100%" style="max-width:560px; background:#ffffff; border-radius:16px; padding:32px; margin:auto; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

    <tr>
      <td style="text-align:center; padding-bottom:16px;">
        <h2 style="margin:0; font-size:20px; font-weight:600; color:#111827;">
          New Message From Your Portfolio
        </h2>
        <p style="margin:6px 0 0; font-size:14px; color:#6B7280;">
          Someone just submitted your contact form
        </p>
      </td>
    </tr>

    <!-- Info Box -->
    <tr>
      <td style="padding-top:24px;">
        <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px; font-size:15px; color:#111827;">
          
          <p style="margin:0 0 12px;">
            <strong style="color:#374151;">Name:</strong><br />
            ${name}
          </p>

          <p style="margin:0 0 12px;">
            <strong style="color:#374151;">Email:</strong><br />
            ${email}
          </p>

          <p style="margin:0;">
            <strong style="color:#374151;">Message:</strong><br />
            <span style="white-space:pre-wrap; line-height:1.6;">${message}</span>
          </p>

        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="text-align:center; padding-top:24px; font-size:12px; color:#9CA3AF;">
        This email was generated automatically from your portfolio contact form.
      </td>
    </tr>

  </table>
</div>
`
  });

  return res.json(new ApiResponse(200, null, "Message sent successfully"));
});
