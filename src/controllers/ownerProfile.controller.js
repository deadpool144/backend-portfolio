import OwnerProfile from "../models/ownerProfile.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

// -------------------------------------------------
// GET OWNER PROFILE (PUBLIC)
// -------------------------------------------------
export const getOwnerProfile = asyncHandler(async (req, res) => {
  const profile = await OwnerProfile.findOne();

  if (!profile) {
    return res.json(new ApiResponse(200, null, "No profile found yet"));
  }

  return res.json(new ApiResponse(200, profile, "Owner profile fetched"));
});

// -------------------------------------------------
// UPDATE OWNER PROFILE (ADMIN ONLY)
// -------------------------------------------------
export const updateOwnerProfile = asyncHandler(async (req, res) => {
  const data = req.body;

  // Parse JSON strings (if needed for arrays/objects)
  if (data.skills && typeof data.skills === "string") {
    data.skills = JSON.parse(data.skills);
  }

  if (data.socialLinks && typeof data.socialLinks === "string") {
    data.socialLinks = JSON.parse(data.socialLinks);
  }

  if (data.experience && typeof data.experience === "string") {
    data.experience = JSON.parse(data.experience);
  }

  if (data.education && typeof data.education === "string") {
    data.education = JSON.parse(data.education);
  }

  // -------------------------------------------------
  // Handle profile photo upload (if provided)
  // -------------------------------------------------
  if (req.file) {
    const existingProfile = await OwnerProfile.findOne();

    // If old image exists → delete from cloudinary
    if (existingProfile?.profilePhoto?.public_id) {
      try {
        await cloudinary.uploader.destroy(existingProfile.profilePhoto.public_id);
      } catch (err) {
        console.log("Failed to delete old profile photo:", err);
      }
    }

    // Upload new photo
    const uploaded = await uploadToCloudinary(req.file.path, "owner_profile");
    data.profilePhoto = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }

  // -------------------------------------------------
  // Create or update (UPSERT = true)
  // -------------------------------------------------
  const updatedProfile = await OwnerProfile.findOneAndUpdate({}, data, {
    new: true,
    upsert: true, // create if not exists
  });

  return res.json(
    new ApiResponse(200, updatedProfile, "Owner profile updated successfully")
  );
});
