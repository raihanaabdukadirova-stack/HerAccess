import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import rateLimit from "express-rate-limit";
import {
  chatController,
  quizController,
  weaknessQuizController,
  essayController,
} from "./ai.controller.js";

const router = Router();

// AI запросы — отдельный лимит (дороже обычных)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 20,
  message: { error: "Too many AI requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

// Чат — доступен всем (авторизованным и нет)
router.post("/chat",           asyncHandler(chatController));

// Квизы и эссе — только авторизованным
router.post("/quiz",           requireAuth, asyncHandler(quizController));
router.post("/weakness-quiz",  requireAuth, asyncHandler(weaknessQuizController));
router.post("/essay",          requireAuth, asyncHandler(essayController));

export default router;
