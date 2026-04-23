import { progressApi } from "./progressApi.js";

// ─── In-memory store (для компонентов без авторизации) ────────────────────────
export const STORE = {
  user: null,
  mistakes: [],
  completedLessons: [],
  testScores: [],
  weakTopics: {},
};

// ─── Запись ошибки ────────────────────────────────────────────────────────────

export async function recordMistake(subject, topic, question, correct, given) {
  // 1. Обновляем память
  STORE.mistakes.push({
    id: Date.now(),
    subject, topic, question, correct, given,
    timestamp: new Date().toISOString(),
  });
  const key = `${subject}:${topic}`;
  STORE.weakTopics[key] = (STORE.weakTopics[key] || 0) + 1;

  // 2. Синхронизируем с БД (если пользователь авторизован)
  if (STORE.user) {
    progressApi.saveMistake({ subject, topic, question, correct, given })
      .catch(() => {}); // тихо игнорируем ошибки сети
  }
}

// ─── Запись пройденного урока ─────────────────────────────────────────────────

export async function recordLesson(subjectKey, levelId, score) {
  // 1. Обновляем память
  STORE.completedLessons.push({
    subjectKey, levelId, score,
    date: new Date().toISOString(),
  });

  // 2. Синхронизируем с БД
  if (STORE.user) {
    progressApi.saveLesson({ subjectKey, levelId, score })
      .catch(() => {});
  }
}

// ─── Запись результата теста ──────────────────────────────────────────────────

export async function recordTestScore(type, score, total, section = "") {
  // 1. Обновляем память
  STORE.testScores.push({
    type, score, total, section,
    date: new Date().toISOString(),
  });

  // 2. Синхронизируем с БД
  if (STORE.user) {
    progressApi.saveTestScore({ type, score, total, section })
      .catch(() => {});
  }
}

// ─── Слабые темы ─────────────────────────────────────────────────────────────

export function getWeakTopics(limit = 5) {
  return Object.entries(STORE.weakTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => ({ topic: k, count: v }));
}

// ─── Загрузка данных из БД при логине ─────────────────────────────────────────
// Вызывается из App.jsx после успешной авторизации

export async function loadUserProgress() {
  if (!STORE.user) return;

  try {
    const { lessons, mistakes, testScores, weakTopics } =
      await progressApi.getDashboard();

    // Заполняем память данными из БД
    STORE.completedLessons = lessons.map((l) => ({
      subjectKey: l.subjectKey,
      levelId: l.levelId,
      score: l.score,
      date: l.completedAt,
    }));

    STORE.mistakes = mistakes.map((m) => ({
      id: m.id,
      subject: m.subject,
      topic: m.topic,
      question: m.question,
      correct: m.correct,
      given: m.given,
      timestamp: m.createdAt,
    }));

    STORE.testScores = testScores.map((t) => ({
      type: t.type,
      score: t.score,
      total: t.total,
      section: t.section ?? "",
      date: t.createdAt,
    }));

    // Восстанавливаем weakTopics из ошибок
    STORE.weakTopics = {};
    weakTopics.forEach(({ topic, count }) => {
      STORE.weakTopics[topic] = count;
    });
  } catch {
    // Если БД недоступна — работаем с пустым стором
  }
}
