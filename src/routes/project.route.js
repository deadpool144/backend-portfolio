import express from "express";
import {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  addComment,
  deleteComment,
} from "../controllers/project.controller.js";

import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { uploadProjectFiles } from "../middlewares/multer.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllProjects);
router.get("/:slug", getProjectBySlug);

// ADMIN
router.post(
  "/",
  protect,
  adminOnly,
  uploadProjectFiles, // <----- FIXED
  createProject
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadProjectFiles, // <----- FIXED
  updateProject
);

router.delete("/:id", protect, adminOnly, deleteProject);

// USER ACTIONS
router.post("/:id/like", protect, likeProject);
router.post("/:id/comment", protect, addComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);

export default router;
