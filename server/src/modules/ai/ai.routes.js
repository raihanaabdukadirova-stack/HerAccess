import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../../config/db.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import {
  chatController,
  essayController,
  quizController,
  weaknessQuizController,
} from './ai.controller.js';

const router = Router();

// Запись rate-limited попадания в AILog (fire-and-forget).
function rateLimitedHandler(type, message) {
  return (req, res, _next, options) => {
    prisma.aILog
      .create({
        data: {
          userId: req.user?.id ?? null,
          type,
          status: 'rate_limited',
          latencyMs: 0,
          errorMsg: message,
        },
      })
      .catch(() => {});
    res.status(options.statusCode).json({ error: message });
  };
}

const AUTH_LIMIT_MSG = 'Too many AI requests. Please slow down.';
const ANON_CHAT_MSG = 'Rate limit reached. Sign in for more AI access.';
const AUTH_CHAT_MSG = 'Too many chat requests. Please slow down.';

// Лимит для авторизованных AI-запросов (квизы, эссе)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedHandler('quiz', AUTH_LIMIT_MSG),
});

// Жёсткий лимит для анонимного чата — защита API-ключа от спама
const anonChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedHandler('chat', ANON_CHAT_MSG),
});

// Лимит для авторизованного чата — мягче
const authChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedHandler('chat', AUTH_CHAT_MSG),
});

// POST /api/ai/chat — доступен всем, но с разным лимитом.
// optionalAuth достаёт req.user если есть Bearer-токен, чтобы лог нёс userId.
router.post(
  '/chat',
  optionalAuth,
  (req, res, next) => {
    if (req.user) return authChatLimiter(req, res, next);
    return anonChatLimiter(req, res, next);
  },
  asyncHandler(chatController)
);

// Квизы, эссе — только авторизованным.
// requireAuth ставим перед лимитером, чтобы rate-limit-логи знали userId.
router.post('/quiz', requireAuth, authLimiter, asyncHandler(quizController));
router.post('/weakness-quiz', requireAuth, authLimiter, asyncHandler(weaknessQuizController));
router.post('/essay', requireAuth, authLimiter, asyncHandler(essayController));

export default router;
