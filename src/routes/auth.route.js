import express from "express";
import { signup, login, logout, getMe, verifyOtp, forgotPassword, resetPassword, resendOtp } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);


// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
