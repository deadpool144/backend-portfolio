import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * sendBrevoMail
 * A helper function to send transactional emails using Brevo (Sendinblue)
 *
 * @param {string} to - Receiver email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
export const sendBrevoMail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.FROM_EMAIL, // e.g. xwebcod@gmail.com
          name: "Portfolio Platform",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Brevo Email Sent:", response.data);
    return response.data;

  } catch (error) {
    // console.error("Brevo Email Error:", error.response?.data || error.message);
    throw new Error("Failed to send email");
  }
};
