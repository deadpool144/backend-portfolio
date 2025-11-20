import { sendBrevoMail } from "./config.brevo.js";

export const brevoOtpSender = async (to, otp) => {
  try {
    const response = await sendBrevoMail({
      to,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is</h2><h1>${otp}</h1><p>Expires in 10 minutes.</p>`
    });
    return response;
  } catch (error) {
    console.error("Brevo OTP Email Error:", error);
    throw new Error("Failed to send OTP email");
  }
};


