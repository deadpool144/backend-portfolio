import { resend } from './resendConfig.js'

export async function resendOptEmail(to, otp) {
  try {
    const email = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p style="font-size: 22px; font-weight: bold;">${otp}</p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });

    return email;
  } catch (err) {
    console.error("Resend email error:", err);
    throw err;
  }
}
