import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import {
  testSchema,
  questionSchema,
  publishSchema,
  userRoleSchema,
  userBanSchema,
} from "./admin.schema.js";
import {
  getStatsController,
  listUsersController,
  getUserDetailController,
  updateUserRoleController,
  setUserBanController,
  deleteUserController,
  getUserProgressController,
  resetUserProgressController,
  listAILogsController,
  getSettingsController,
  updateSettingsController,
  getAllTestsController,
  getTestByIdController,
  createTestController,
  updateTestController,
  deleteTestController,
  publishTestController,
  addQuestionController,
  updateQuestionController,
  deleteQuestionController,
} from "./admin.controller.js";

const router = Router();

// Все роуты требуют ADMIN роль
router.use(requireAuth, requireRole("ADMIN"));

// ─── Dashboard stats (§2.1) ───────────────────────────────────────────────────

router.get("/stats", asyncHandler(getStatsController));

// ─── Users (§2.2) ─────────────────────────────────────────────────────────────

router.get("/users", asyncHandler(listUsersController));
router.get("/users/:id", asyncHandler(getUserDetailController));
router.patch("/users/:id/role", userRoleSchema, validate, asyncHandler(updateUserRoleController));
router.patch("/users/:id/ban", userBanSchema, validate, asyncHandler(setUserBanController));
router.delete("/users/:id", asyncHandler(deleteUserController));
router.get("/users/:id/progress", asyncHandler(getUserProgressController));
router.post("/users/:id/reset-progress", asyncHandler(resetUserProgressController));

// ─── AI Logs (§2.4) ───────────────────────────────────────────────────────────

router.get("/ai-logs", asyncHandler(listAILogsController));

// ─── Settings (§2.5) ──────────────────────────────────────────────────────────

router.get("/settings", asyncHandler(getSettingsController));
router.patch("/settings", asyncHandler(updateSettingsController));

// ─── Tests ────────────────────────────────────────────────────────────────────

router.get("/tests", asyncHandler(getAllTestsController));
router.get("/tests/:id", asyncHandler(getTestByIdController));
router.post("/tests", testSchema, validate, asyncHandler(createTestController));
router.patch("/tests/:id", testSchema, validate, asyncHandler(updateTestController));
router.delete("/tests/:id", asyncHandler(deleteTestController));
router.patch("/tests/:id/publish", publishSchema, validate, asyncHandler(publishTestController));

// ─── Questions ────────────────────────────────────────────────────────────────

router.post("/tests/:testId/questions", questionSchema, validate, asyncHandler(addQuestionController));
router.patch("/questions/:id", questionSchema, validate, asyncHandler(updateQuestionController));
router.delete("/questions/:id", asyncHandler(deleteQuestionController));

export default router;
