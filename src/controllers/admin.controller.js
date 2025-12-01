import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// --------------------------------------------------------------------------
// GET ALL USERS  (Admin)
// --------------------------------------------------------------------------
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, users, "All users fetched"));
});

// --------------------------------------------------------------------------
// GET SINGLE USER (Admin)
// --------------------------------------------------------------------------
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, user, "User fetched"));
});

// --------------------------------------------------------------------------
// UPDATE USER ROLE (Admin)
// --------------------------------------------------------------------------
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  // Prevent admin from changing their own role
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password");

  if (!updatedUser) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, updatedUser, "User role updated"));
});

// --------------------------------------------------------------------------
// DELETE USER (Admin)
// --------------------------------------------------------------------------
export const deleteUser = asyncHandler(async (req, res) => {
  // Prevent admin deleting their own account
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot delete yourself");
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) throw new ApiError(404, "User not found");

  return res.json(new ApiResponse(200, null, "User deleted"));
});

// --------------------------------------------------------------------------
// ADMIN DASHBOARD STATS (Admin)
// --------------------------------------------------------------------------
export const getAdminStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const projectsCount = await Project.countDocuments();
  const featuredProjectsCount = await Project.countDocuments({ isFeatured: true });

  const allProjects = await Project.find().select("likes comments createdAt");

  // Total likes & comments across all projects
  const totalLikes = allProjects.reduce((sum, p) => sum + p.likes.length, 0);
  const totalComments = allProjects.reduce((sum, p) => sum + p.comments.length, 0);

  // Latest activity (for graphs)
  const latestUsers = await User.find()
    .select("name email role createdAt")
    .sort({ createdAt: -1 })
    .limit(7);

  const latestProjects = await Project.find()
    .select("title slug createdAt")
    .sort({ createdAt: -1 })
    .limit(7);

  return res.json(
    new ApiResponse(200, {
      usersCount,
      projectsCount,
      featuredProjectsCount,
      totalLikes,
      totalComments,
      latestUsers,
      latestProjects
    }, "Admin dashboard stats fetched")
  );
});


// --------------------------------------------------------------------------
// BLOCK OR UNBLOCK USER (Admin)
// --------------------------------------------------------------------------

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Invalid ID
  if (!userId || userId.length !== 24) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Prevent blocking yourself
  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "You cannot block your own admin account");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Prevent blocking the only admin
  if (user.role === "admin") {
    throw new ApiError(403, "You cannot block the only admin account");
  }

  // Toggle block state
  user.isBlocked = !user.isBlocked;
  await user.save();

  const status = user.isBlocked ? "blocked" : "unblocked";

  return res.json(
    new ApiResponse(200, user, `User has been ${status} successfully`)
  );
});
