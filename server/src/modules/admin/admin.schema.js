import { body } from "express-validator";

// Валидация создания/обновления теста
export const testSchema = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required.")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters."),

  body("type")
    .trim()
    .notEmpty().withMessage("Type is required.")
    .isIn(["sat_math", "sat_rw", "ielts_reading", "ielts_writing", "ielts_listening", "custom"])
    .withMessage("Invalid test type."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description max 1000 characters."),

  body("timeLimit")
    .optional()
    .isInt({ min: 60 }).withMessage("Time limit must be at least 60 seconds."),

  body("isPublished")
    .optional()
    .isBoolean().withMessage("isPublished must be boolean."),

  body("questions")
    .optional()
    .isArray().withMessage("Questions must be an array."),
];

// Валидация вопроса
export const questionSchema = [
  body("orderIndex")
    .isInt({ min: 0 }).withMessage("Order index must be >= 0."),

  body("type")
    .trim()
    .notEmpty().withMessage("Question type is required.")
    .isIn(["mcq", "grid", "essay"]).withMessage("Invalid question type."),

  body("section")
    .optional()
    .trim(),

  body("questionText")
    .trim()
    .notEmpty().withMessage("Question text is required.")
    .isLength({ min: 5 }).withMessage("Question must be at least 5 characters."),

  body("options")
    .optional()
    .custom((value, { req }) => {
      if (req.body.type === "mcq" && (!Array.isArray(value) || value.length < 2)) {
        throw new Error("MCQ must have at least 2 options.");
      }
      return true;
    }),

  body("correctAnswer")
    .notEmpty().withMessage("Correct answer is required."),

  body("explanation")
    .optional()
    .trim(),
];

// Валидация публикации
export const publishSchema = [
  body("isPublished")
    .isBoolean().withMessage("isPublished must be boolean."),
];

// ─── Users (§2.2) ────────────────────────────────────────────────────────────

export const userRoleSchema = [
  body("role")
    .isIn(["STUDENT", "ADMIN"])
    .withMessage("Role must be STUDENT or ADMIN."),
];

export const userBanSchema = [
  body("banned")
    .isBoolean()
    .withMessage("banned must be boolean."),
  body("reason")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason max 500 characters."),
];
