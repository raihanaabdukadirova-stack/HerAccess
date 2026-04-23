import { body } from "express-validator";

export const lessonSchema = [
  body("subjectKey").trim().notEmpty().withMessage("subjectKey is required."),
  body("levelId").trim().notEmpty().withMessage("levelId is required."),
  body("score").isInt({ min: 0 }).withMessage("score must be a non-negative integer."),
];

export const mistakeSchema = [
  body("subject").trim().notEmpty().withMessage("subject is required."),
  body("topic").trim().notEmpty().withMessage("topic is required."),
  body("question").trim().notEmpty().withMessage("question is required."),
  body("correct").trim().notEmpty().withMessage("correct is required."),
  body("given").trim().notEmpty().withMessage("given is required."),
];

export const testScoreSchema = [
  body("type").trim().notEmpty().withMessage("type is required."),
  body("score").isInt({ min: 0 }).withMessage("score must be a non-negative integer."),
  body("total").isInt({ min: 1 }).withMessage("total must be a positive integer."),
  body("section").optional().isString(),
];
