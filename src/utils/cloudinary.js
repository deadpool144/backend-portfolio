import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




// Upload single file
export const uploadToCloudinary = async (localFilePath, folder = "portfolio") => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto", // auto detects image/video
    });

    // Delete local file
    fs.unlinkSync(localFilePath);

    return result; // returns url + public_id
  } catch (err) {
    console.error("Cloudinary upload error:", err);

    // Delete file even if upload fails
    fs.unlinkSync(localFilePath);

    throw err;
  }
};
