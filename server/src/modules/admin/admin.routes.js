import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { testSchema, questionSchema, publishSchema } from "./admin.schema.js";
import {
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
