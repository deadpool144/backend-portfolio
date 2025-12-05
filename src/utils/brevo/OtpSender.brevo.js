import { sendBrevoMail } from "./config.brevo.js";

export const brevoOtpSender = async (to, otp) => {
  try {
    const response = await sendBrevoMail({
      to,
      subject: "Your OTP Code",
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7f7f8; padding: 40px 0;">
  <table align="center" width="100%" style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 32px;">
    
    <tr>
      <td style="text-align: center; padding-bottom: 8px;">
        <div style="font-size: 14px; color: #6B7280; letter-spacing: 0.08em; text-transform: uppercase;">
          Verification Code
        </div>
      </td>
    </tr>

    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <div style="font-size: 16px; color: #374151;">
          Use the code below to continue. This code expires in <strong>10 minutes</strong>.
        </div>
      </td>
    </tr>

    <!-- OTP Box -->
    <tr>
      <td style="text-align: center;">
        <div style="
          display: inline-block;
          font-size: 32px;
          letter-spacing: 14px;
          font-weight: bold;
          color: #111827;
          padding: 16px 28px;
          border-radius: 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        ">
          ${otp}
        </div>
      </td>
    </tr>

    <!-- Expiry Notice -->
    <tr>
      <td style="text-align: center; padding-top: 20px; color: #6B7280; font-size: 14px;">
        This code will expire shortly for your security.
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding-top: 32px; text-align: center; font-size: 12px; color: #9CA3AF;">
        If you didn’t request this code, you can safely ignore this email.
      </td>
    </tr>

  </table>
</div>
`
    });

    return response;
  } catch (error) {
    console.error("Brevo OTP Email Error:", error);
    throw new Error("Failed to send OTP email");
  }
};
