import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
// import { sendEmail } from "../utils/sendEmail.js";
import { brevoOtpSender } from "../utils/brevo/OtpSender.brevo.js";


/* -----------------------------------------
   🛠 Helper: Generate JWT Token
----------------------------------------- */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


/* -----------------------------------------
   🔹 SIGNUP WITH OTP
----------------------------------------- */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Send OTP email — if fails, delete the user
  try {
    await brevoOtpSender(email,otp);
    // await sendEmail({
    //   to: email,
    //   subject: "Verify Your Email",
    //   html: `
    //     <p>Hello ${name},</p>
    //     <p>Your verification code is: <b>${otp}</b></p>
    //     <p>This code expires in 10 minutes.</p>
    //   `,
    // });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    console.error("OTP email failed:", err);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to send OTP email."));
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { id: user._id, name: user.name, email: user.email },
      "Signup successful — OTP sent to email"
    )
  );
});


/* -----------------------------------------
   🔹 VERIFY OTP
----------------------------------------- */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.otp !== otp) throw new ApiError(400, "Invalid OTP");
  if (user.otpExpires < Date.now()) throw new ApiError(400, "OTP expired");

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  return res.json(new ApiResponse(200, null, "Email verified successfully"));
});


/* -----------------------------------------
   🔹 LOGIN (Only if verified)
----------------------------------------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid email or password");

  if (!user.isVerified) {
    throw new ApiError( 403, "Email not verified. Please verify your account.");
  }
  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Contact support.");
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(400, "Invalid email or password");

  // Generate token
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json(
    new ApiResponse(
      200,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "Login successful"
    )
  );
});


/* -----------------------------------------
   🔹 LOGOUT
----------------------------------------- */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json(new ApiResponse(200, null, "Logged out successfully"));
});


/* -----------------------------------------
   🔹 GET LOGGED-IN USER
----------------------------------------- */
// export const getMe = asyncHandler(async (req, res) => {
//   return res.json(
//     new ApiResponse(
//       200,
//       {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//       },
//       "User fetched successfully"
//     )
//   );
// });
export const getMe = asyncHandler(async (req, res) => {
  return res.json(
    new ApiResponse(
      200,
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        isBlocked: req.user.isBlocked,
      },
      "User fetched successfully"
    )
  );
});



/* -----------------------------------------
   🔹 FORGOT PASSWORD (send OTP)
----------------------------------------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: `<p>Your password reset code is: <b>${otp}</b></p>`,
  });

  return res.json(new ApiResponse(200, null, "OTP sent to email"));
});


/* -----------------------------------------
   🔹 RESET PASSWORD
----------------------------------------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.otp !== otp) throw new ApiError(400, "Invalid OTP");
  if (user.otpExpires < Date.now()) throw new ApiError(400, "OTP expired");

  user.password = newPassword; // hashed automatically (pre-save)
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  return res.json(new ApiResponse(200, null, "Password reset successful"));
});
  

// -----------------------------------------
//     RESEND OTP (after failed verification)
// -----------------------------------------
// export const resendOtp = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) throw new ApiError(404, "User not found");

//   if (user.isVerified) {
//     return res.status(400).json(new ApiResponse(400, null, "Email already verified"));
//   }

//   // Generate new 4-digit OTP
//   const otp = Math.floor(1000 + Math.random() * 9000);

//   user.otp = otp;
//   user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   await user.save();

//   // Send Email
// try {
//     await brevoOtpSender(email,otp);
//     // await sendEmail({
//     //   to: email,
//     //   subject: "Verify Your Email",
//     //   html: `
//     //     <p>Hello ${name},</p>
//     //     <p>Your verification code is: <b>${otp}</b></p>
//     //     <p>This code expires in 10 minutes.</p>
//     //   `,
//     // });
//   } catch (err) {
//     await User.findByIdAndDelete(user._id);
//     console.error("OTP email failed:", err);
//     return res
//       .status(500)
//       .json(new ApiResponse(500, null, "Failed to send OTP email."));
//   }

//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       { id: user._id, name: user.name, email: user.email },
//       "Signup successful — OTP sent to email"
//     )
//   );
// });
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  // Generate new 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);

  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();
  try {
    await brevoOtpSender(email, otp);
  } catch (error) {
    console.error("OTP resend failed:", error);

    // IMPORTANT: Do NOT delete user on resend failure
    throw new ApiError(500, "Failed to send OTP email");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email },
      "OTP resent successfully"
    )
  );
});

