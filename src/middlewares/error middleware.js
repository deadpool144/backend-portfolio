import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  console.log("🔥 ERROR:", err);

  // If this was thrown using ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Default fallback
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
