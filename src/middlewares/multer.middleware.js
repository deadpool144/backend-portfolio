import fs from "fs";
import path from "path";
import multer from "multer";

// 🚀 Ensure uploads folder exists (Render compatible)
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads folder created");
} else {
  console.log("📁 uploads folder already exists");
}

// STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// IMAGE FILTER
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

// VIDEO FILTER
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) cb(null, true);
  else cb(new Error("Only video files allowed"), false);
};

// UPLOADERS
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

// PROJECT UPLOAD (coverImage + images + optional video)
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
