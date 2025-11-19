import multer from "multer";
import path from "path";

// Temporary disk storage (before uploading to Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // LOCAL TEMP FOLDER
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Image filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

// Video filter
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files allowed"), false);
  }
};

// Uploaders
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
}).single("image");

export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
}).array("images", 10);

export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
}).single("video");

// For project (coverImage + galleryImages)
export const uploadProjectFiles = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);
