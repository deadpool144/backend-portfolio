import express from "express";
import { getOwnerProfile, updateOwnerProfile } from "../controllers/ownerProfile.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public: Fetch owner profile
router.get("/", getOwnerProfile);

// Admin only: Update owner profile
router.put("/", protect, adminOnly, uploadSingleImage, updateOwnerProfile);

export default router;
