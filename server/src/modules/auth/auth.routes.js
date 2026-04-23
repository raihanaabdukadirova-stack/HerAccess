import { Router } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  logoutAllController,
  getMeController,
} from "./auth.controller.js";

const router = Router();

// Public routes
router.post("/register", registerSchema, validate, asyncHandler(registerController));
router.post("/login",    loginSchema,    validate, asyncHandler(loginController));
router.post("/refresh",                            asyncHandler(refreshController));
router.post("/logout",                             asyncHandler(logoutController));

// Protected routes
router.post("/logout-all", requireAuth, asyncHandler(logoutAllController));
router.get("/me",          requireAuth, asyncHandler(getMeController));

export default router;
