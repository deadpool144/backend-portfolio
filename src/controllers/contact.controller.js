import { sendEmail } from "../utils/sendEmail.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const contactMe = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  await sendEmail({
    to: process.env.EMAIL_USER,
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
