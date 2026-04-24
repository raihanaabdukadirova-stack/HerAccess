import { api } from './api.js';

// ─── Все AI вызовы идут через сервер — ключ Gemini хранится в server/.env ─────

export class AIError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'AIError';
    this.code = code; // "RATE_LIMIT", "AUTH_ERROR", "TIMEOUT", "SERVER_ERROR"
  }
}

export async function callAI(system, userMsg, maxTokens = 1200) {
  try {
    const { text } = await api.post('/api/ai/chat', {
      system,
      message: userMsg,
      maxTokens,
    });
    return text;
  } catch (err) {
    // Определяем тип ошибки по статусу
    if (err.status === 429) {
      throw new AIError(
        err.message || 'Too many requests. Please wait a moment and try again.',
        'RATE_LIMIT'
      );
    }
    if (err.status === 401 || err.status === 403) {
      throw new AIError('AI service authentication error. Please contact support.', 'AUTH_ERROR');
    }
    if (err.status >= 500) {
      throw new AIError(
        'AI service temporarily unavailable. Please try again in a moment.',
        'SERVER_ERROR'
      );
    }
    // Сетевая ошибка (нет err.status)
    if (!err.status) {
      throw new AIError('Connection issue — check your internet and try again.', 'NETWORK_ERROR');
    }
    // Остальные случаи
    throw new AIError(err.message || 'Something went wrong. Please try again.');
  }
}

export async function generateQuiz(subject, levelTitle, topics, count = 10) {
  try {
    const { questions } = await api.post('/api/ai/quiz', {
      subject,
      levelTitle,
      topics,
      count,
    });
    return questions;
  } catch (err) {
    // При ошибке генерации квиза — показываем fallback вместо краша
    console.warn('[AI] Quiz generation failed, using fallback:', err.message);
    return topics.slice(0, Math.min(count, topics.length)).map((t) => ({
      q: `Key concept in "${t}"?`,
      opts: ['Option A', 'Option B (correct)', 'Option C', 'Option D'],
      ans: 1,
      exp: `Covers fundamentals of ${t} in ${subject}.`,
      topic: t,
    }));
  }
}

export async function generateWeaknessQuiz(weakTopics) {
  try {
    const { questions } = await api.post('/api/ai/weakness-quiz', { weakTopics });
    return questions;
  } catch (err) {
    console.warn('[AI] Weakness quiz generation failed, using fallback:', err.message);
    return weakTopics.slice(0, 5).map((w) => ({
      q: `Review: what is key about "${w.topic.split(':')[1] || w.topic}"?`,
      opts: ['Option A', 'Option B', 'Option C', 'Option D'],
      ans: 1,
      exp: `You missed this ${w.count} time(s). Review carefully.`,
      topic: w.topic,
    }));
  }
}

export const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
