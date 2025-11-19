import Project from "../models/project.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

// --------------------------------------------------
// PUBLIC — GET ALL PROJECTS
// --------------------------------------------------
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .select("title slug shortDescription coverImage techStack category isFeatured")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, projects, "Projects fetched"));
});

// --------------------------------------------------
// PUBLIC — GET PROJECT BY SLUG
// --------------------------------------------------
export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });

  if (!project) throw new ApiError(404, "Project not found");

  res.json(new ApiResponse(200, project, "Project fetched"));
});

// --------------------------------------------------
// ADMIN — CREATE PROJECT
// --------------------------------------------------
export const createProject = asyncHandler(async (req, res) => {
  const data = req.body;

  // Parse JSON fields (if sent as strings)
  if (typeof data.techStack === "string") data.techStack = JSON.parse(data.techStack);
  if (typeof data.features === "string") data.features = JSON.parse(data.features);
  if (typeof data.tags === "string") data.tags = JSON.parse(data.tags);

  // ---------------------------
  // Handle cover image upload
  // ---------------------------
  if (req.files?.coverImage) {
    const uploadedCover = await uploadToCloudinary(
      req.files.coverImage[0].path,
      "project_covers"
    );
    data.coverImage = {
      url: uploadedCover.secure_url,
      public_id: uploadedCover.public_id,
    };
  }

  // ---------------------------
  // Handle gallery images upload
  // ---------------------------
  if (req.files?.images) {
    data.images = [];

    for (const img of req.files.images) {
      const uploadedImg = await uploadToCloudinary(img.path, "project_gallery");
      data.images.push({
        url: uploadedImg.secure_url,
        public_id: uploadedImg.public_id,
      });
    }
  }

  // ---------------------------
  // Handle video upload (optional)
  // ---------------------------
  if (req.files?.video) {
    const uploadedVideo = await uploadToCloudinary(
      req.files.video[0].path,
      "project_videos",
      "video"
    );
    data.video = {
      url: uploadedVideo.secure_url,
      public_id: uploadedVideo.public_id,
    };
  }

  // Add createdBy
  data.createdBy = req.user._id;

  const project = await Project.create(data);

  res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

// --------------------------------------------------
// ADMIN — UPDATE PROJECT
// --------------------------------------------------
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (typeof data.techStack === "string") data.techStack = JSON.parse(data.techStack);
  if (typeof data.features === "string") data.features = JSON.parse(data.features);
  if (typeof data.tags === "string") data.tags = JSON.parse(data.tags);

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  // ---------------------------
  // Replace cover image
  // ---------------------------
  if (req.files?.coverImage) {
    if (project.coverImage?.public_id) {
      await cloudinary.uploader.destroy(project.coverImage.public_id);
    }

    const uploadedCover = await uploadToCloudinary(
      req.files.coverImage[0].path,
      "project_covers"
    );

    data.coverImage = {
      url: uploadedCover.secure_url,
      public_id: uploadedCover.public_id,
    };
  }

  // ---------------------------
  // Replace gallery images (optional)
  // ---------------------------
  if (req.files?.images) {
    // delete old
    for (const img of project.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    data.images = [];

    for (const img of req.files.images) {
      const uploadedImg = await uploadToCloudinary(img.path, "project_gallery");
      data.images.push({
        url: uploadedImg.secure_url,
        public_id: uploadedImg.public_id,
      });
    }
  }

  // ---------------------------
  // Replace video (optional)
  // ---------------------------
  if (req.files?.video) {
    if (project.video?.public_id) {
      await cloudinary.uploader.destroy(project.video.public_id, { resource_type: "video" });
    }

    const uploadedVideo = await uploadToCloudinary(
      req.files.video[0].path,
      "project_videos",
      "video"
    );

    data.video = {
      url: uploadedVideo.secure_url,
      public_id: uploadedVideo.public_id,
    };
  }

  const updated = await Project.findByIdAndUpdate(id, data, { new: true });

  res.json(new ApiResponse(200, updated, "Project updated successfully"));
});

// --------------------------------------------------
// ADMIN — DELETE PROJECT
// --------------------------------------------------
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  // Delete media
  if (project.coverImage?.public_id)
    await cloudinary.uploader.destroy(project.coverImage.public_id);

  for (const img of project.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  if (project.video?.public_id)
    await cloudinary.uploader.destroy(project.video.public_id, { resource_type: "video" });

  await project.deleteOne();

  res.json(new ApiResponse(200, null, "Project deleted"));
});

// --------------------------------------------------
// USER — LIKE / UNLIKE
// --------------------------------------------------
export const likeProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  const userId = req.user._id;

  // Toggle like
  const alreadyLiked = project.likes.includes(userId);

  if (alreadyLiked) {
    project.likes.pull(userId);
  } else {
    project.likes.push(userId);
  }

  await project.save();

  res.json(
    new ApiResponse(200, {
      liked: !alreadyLiked,
      likesCount: project.likes.length,
    })
  );
});

// --------------------------------------------------
// USER — ADD COMMENT
// --------------------------------------------------
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) throw new ApiError(400, "Comment text required");

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  project.comments.push({
    user: req.user._id,
    text,
    createdAt: Date.now(),
  });

  await project.save();

  res.json(new ApiResponse(200, project.comments, "Comment added"));
});

// --------------------------------------------------
// USER/ADMIN — DELETE COMMENT
// --------------------------------------------------
export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  const comment = project.comments.id(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  // Allow admin or comment owner
  if (String(comment.user) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed");
  }

  comment.remove();
  await project.save();

  res.json(new ApiResponse(200, project.comments, "Comment deleted"));
});
