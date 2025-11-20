import OwnerProfile from "../models/ownerProfile.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

// -------------------------------------------------
// GET OWNER PROFILE (PUBLIC)
// -------------------------------------------------
export const getOwnerProfile = asyncHandler(async (req, res) => {
  const profile = await OwnerProfile.findOne();

  return res.json(
    new ApiResponse(
      200,
      profile || null,
      profile ? "Owner profile fetched" : "No profile found yet"
    )
  );
});

// -------------------------------------------------
// UPDATE OWNER PROFILE (ADMIN ONLY)
// -------------------------------------------------
export const updateOwnerProfile = asyncHandler(async (req, res) => {
  let data = req.body;

  // -------------------------------------------------
  // Fix: Parse JSON for "fields from FormData"
  // -------------------------------------------------
  const jsonFields = ["skills", "socialLinks", "experience", "education", "customSections"];

  jsonFields.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (err) {
        console.log(`Failed to parse ${field}:`, err);
      }
    }
  });

  // -------------------------------------------------
  // HANDLE PROFILE PHOTO
  // -------------------------------------------------
  if (req.file) {
    const existing = await OwnerProfile.findOne();

    // Delete old image if exists
    if (existing?.profilePhoto?.public_id) {
      try {
        await cloudinary.uploader.destroy(existing.profilePhoto.public_id);
      } catch (err) {
        console.log("Failed to delete old image:", err);
      }
    }

    // Upload new image
    const uploaded = await uploadToCloudinary(req.file.path, "owner_profile");

    data.profilePhoto = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }

  // -------------------------------------------------
  // CREATE OR UPDATE PROFILE (UPSERT)
// -------------------------------------------------
  const updatedProfile = await OwnerProfile.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
  });

  return res.json(
    new ApiResponse(200, updatedProfile, "Owner profile updated successfully")
  );
});
