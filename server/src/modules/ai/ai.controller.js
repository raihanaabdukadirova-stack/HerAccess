import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import prisma from '../../config/db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL = process.env.GEMINI_MODEL;

// Лог AI-вызова. Никогда не блокируем ответ — кетчим всё внутри.
function logAI({ userId, type, startedAt, status, errorMsg }) {
  prisma.aILog
    .create({
      data: {
        userId: userId ?? null,
        type,
        latencyMs: Math.max(0, Date.now() - startedAt),
        status,
        errorMsg: errorMsg ? String(errorMsg).slice(0, 500) : null,
      },
    })
    .catch(() => {});
}

async function callGemini(system, userMsg, maxTokens = 1200) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  });

  try {
    const result = await model.generateContent(userMsg);
    const response = result.response;

    if (!response) {
      const err = new Error('Gemini returned empty response');
      err.status = 502;
      throw err;
    }

    return response.text();
  } catch (error) {
    // Обрабатываем специфичные ошибки Gemini API
    if (error.message?.includes('API key')) {
      const err = new Error('AI service configuration error');
      err.status = 500;
      throw err;
    }
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      const err = new Error('AI service rate limit reached. Please try again in a moment.');
      err.status = 429;
      throw err;
    }
    if (error.status === 503 || error.message?.includes('unavailable')) {
      const err = new Error('AI service temporarily unavailable');
      err.status = 503;
      throw err;
    }
    // Оригинальная ошибка прокидывается дальше
    throw error;
  }
}

// POST /api/ai/chat
// body: { system, message, maxTokens? }
export async function chatController(req, res) {
  const { system, message, maxTokens = 1000 } = req.body;

  if (!message?.trim()) {
    return res.status(422).json({ error: 'message is required.' });
  }

  const startedAt = Date.now();
  const userId = req.user?.id ?? null;

  try {
    const text = await callGemini(system, message, maxTokens);
    logAI({ userId, type: 'chat', startedAt, status: 'ok' });
    res.json({ text });
  } catch (error) {
    const status = error.status || 500;
    const errMsg = error.message || 'AI request failed';

    logAI({ userId, type: 'chat', startedAt, status: 'error', errorMsg: errMsg });
    console.error('[AI Error]', status, errMsg, error);
    res.status(status).json({ error: errMsg });
  }
}

// POST /api/ai/quiz
// body: { subject, levelTitle, topics, count? }
export async function quizController(req, res) {
  const { subject, levelTitle, topics, count = 10 } = req.body;

  if (!subject || !levelTitle || !Array.isArray(topics)) {
    return res.status(422).json({ error: 'subject, levelTitle, topics[] are required.' });
  }

  const startedAt = Date.now();
  const userId = req.user?.id ?? null;

  try {
    const raw = await callGemini(
      'Generate educational quiz questions as valid JSON only. Return nothing except the JSON array.',
      `Generate ${count} MCQ questions for ${subject} - ${levelTitle}. Topics: ${topics.join(', ')}. Return JSON array: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    const questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
    logAI({ userId, type: 'quiz', startedAt, status: 'ok' });
    res.json({ questions });
  } catch (error) {
    logAI({ userId, type: 'quiz', startedAt, status: 'error', errorMsg: error.message });
    console.error('[Quiz Gen Error]', error);

    // Не блокируем урок — клиент покажет fallback
    const questions = topics.slice(0, count).map((t) => ({
      q: `Key concept in "${t}"?`,
      opts: ['Option A', 'Option B (correct)', 'Option C', 'Option D'],
      ans: 1,
      exp: `Covers fundamentals of ${t} in ${subject}.`,
      topic: t,
    }));
    res.json({ questions });
  }
}

// POST /api/ai/weakness-quiz
// body: { weakTopics: [{topic, count}] }
export async function weaknessQuizController(req, res) {
  const { weakTopics } = req.body;

  if (!Array.isArray(weakTopics) || !weakTopics.length) {
    return res.status(422).json({ error: 'weakTopics[] is required.' });
  }

  const list = weakTopics.map((w) => w.topic.split(':')[1] || w.topic).join(', ');

  const startedAt = Date.now();
  const userId = req.user?.id ?? null;

  try {
    const raw = await callGemini(
      'Generate targeted quiz questions as valid JSON only. Return nothing except the JSON array.',
      `10 questions for weak areas: ${list}. Return JSON: [{"q":"...","opts":["A","B","C","D"],"ans":0,"exp":"...","topic":"..."}]`,
      1500
    );
    const questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
    logAI({ userId, type: 'weakness-quiz', startedAt, status: 'ok' });
    res.json({ questions });
  } catch (error) {
    logAI({ userId, type: 'weakness-quiz', startedAt, status: 'error', errorMsg: error.message });
    console.error('[Weakness Quiz Error]', error);

    const questions = weakTopics.slice(0, 5).map((w) => ({
      q: `Review: what is key about "${w.topic.split(':')[1] || w.topic}"?`,
      opts: ['Option A', 'Option B', 'Option C', 'Option D'],
      ans: 1,
      exp: `You missed this ${w.count} time(s). Review carefully.`,
      topic: w.topic,
    }));
    res.json({ questions });
  }
}

// POST /api/ai/essay
// body: { essay }
export async function essayController(req, res) {
  const { essay } = req.body;

  if (!essay?.trim() || essay.trim().split(/\s+/).length < 50) {
    return res.status(422).json({ error: 'Essay must be at least 50 words.' });
  }

  const startedAt = Date.now();
  const userId = req.user?.id ?? null;

  try {
    const raw = await callGemini(
      `You are an expert IELTS examiner. Respond ONLY with valid JSON, no markdown, no explanation: {"band":7.0,"task_achievement":7,"coherence":7,"vocabulary":6.5,"grammar":7,"feedback":"2-3 sentences","improvements":["tip1","tip2","tip3"]}`,
      `IELTS Task 2 essay to evaluate:\n\n${essay}`,
      800
    );
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    logAI({ userId, type: 'essay', startedAt, status: 'ok' });
    res.json(result);
  } catch (error) {
    logAI({ userId, type: 'essay', startedAt, status: 'error', errorMsg: error.message });
    console.error('[Essay Check Error]', error);
    res.status(502).json({ error: 'Could not evaluate essay. Please try again.' });
  }
}
