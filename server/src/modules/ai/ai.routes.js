import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import {
  chatController,
  essayController,
  quizController,
  weaknessQuizController,
} from './ai.controller.js';

const router = Router();

// Лимит для авторизованных AI-запросов (квизы, эссе, speaking feedback)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Жёсткий лимит для анонимного чата — защита API-ключа от спама
const anonChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Rate limit reached. Sign in for more AI access.' },
  standardHeaders: true,
  legacyHeaders: false,
  // keyGenerator по умолчанию использует IP — достаточно для MVP
});

// Лимит для авторизованного чата — мягче
const authChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many chat requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ai/chat — доступен всем, но с разным лимитом
// Middleware проверяет наличие Bearer token: если есть — мягкий лимит,
// если нет — жёсткий. requireAuth не вызываем, чтобы не блокировать анонимов.
router.post(
  '/chat',
  (req, res, next) => {
    const hasToken = !!req.headers.authorization?.startsWith('Bearer ');
    if (hasToken) {
      return authChatLimiter(req, res, next);
    }
    return anonChatLimiter(req, res, next);
  },
  asyncHandler(chatController)
);

// Квизы, эссе, speaking — только авторизованным
router.post('/quiz', authLimiter, requireAuth, asyncHandler(quizController));
router.post('/weakness-quiz', authLimiter, requireAuth, asyncHandler(weaknessQuizController));
router.post('/essay', authLimiter, requireAuth, asyncHandler(essayController));

export default router;
