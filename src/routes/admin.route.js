import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminStats,
  toggleBlockUser,
} from "../controllers/admin.controller.js";

import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ------------------------------------------
// USER MANAGEMENT ROUTES
// ------------------------------------------
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/delete/:id", protect, adminOnly, deleteUser);
router.patch("/toggle-block/:id",protect, adminOnly, toggleBlockUser);

// ------------------------------------------
// DASHBOARD STATS ROUTE
// ------------------------------------------
router.get("/stats", protect, adminOnly, getAdminStats);

export default router;
