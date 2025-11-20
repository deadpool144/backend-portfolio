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
    <h2>New message from portfolio</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong><br/>${message}</p>
  `,
});

  return res.json(new ApiResponse(200, null, "Message sent successfully"));
});
