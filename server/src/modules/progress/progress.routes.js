import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { lessonSchema, mistakeSchema, testScoreSchema } from "./progress.schema.js";
import {
  dashboardController,
  saveLessonController,
  getLessonsController,
  saveMistakeController,
  getMistakesController,
  getWeakTopicsController,
  saveTestScoreController,
  getTestScoresController,
} from "./progress.controller.js";

const router = Router();

// Все роуты требуют авторизации
router.use(requireAuth);

// Dashboard — всё сразу
router.get("/dashboard", asyncHandler(dashboardController));

// Lessons
router.post("/lessons",  lessonSchema,    validate, asyncHandler(saveLessonController));
router.get("/lessons",                              asyncHandler(getLessonsController));

// Mistakes
router.post("/mistakes", mistakeSchema,   validate, asyncHandler(saveMistakeController));
router.get("/mistakes",                             asyncHandler(getMistakesController));
router.get("/weak-topics",                          asyncHandler(getWeakTopicsController));

// Test scores
router.post("/test-scores", testScoreSchema, validate, asyncHandler(saveTestScoreController));
router.get("/test-scores",                           asyncHandler(getTestScoresController));

export default router;
