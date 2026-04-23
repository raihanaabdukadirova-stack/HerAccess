import { api } from "./api.js";

// ─── Все AI вызовы теперь идут через наш сервер ───────────────────────────────
// Ключ Anthropic хранится только в server/.env

export async function callAI(system, userMsg, maxTokens = 1200) {
  const { text } = await api.post("/api/ai/chat", {
    system,
    message: userMsg,
    maxTokens,
  });
  return text;
}

export async function generateQuiz(subject, levelTitle, topics, count = 10) {
  try {
    const { questions } = await api.post("/api/ai/quiz", {
      subject,
      levelTitle,
      topics,
      count,
    });
    return questions;
  } catch {
    // Fallback на случай недоступности сервера
    return topics.slice(0, Math.min(count, topics.length)).map((t) => ({
      q: `Key concept in "${t}"?`,
      opts: ["Option A", "Option B (correct)", "Option C", "Option D"],
      ans: 1,
      exp: `Covers fundamentals of ${t} in ${subject}.`,
      topic: t,
    }));
  }
}

export async function generateWeaknessQuiz(weakTopics) {
  try {
    const { questions } = await api.post("/api/ai/weakness-quiz", { weakTopics });
    return questions;
  } catch {
    return weakTopics.slice(0, 5).map((w) => ({
      q: `Review: what is key about "${w.topic.split(":")[1] || w.topic}"?`,
      opts: ["Option A", "Option B", "Option C", "Option D"],
      ans: 1,
      exp: `You missed this ${w.count} time(s). Review carefully.`,
      topic: w.topic,
    }));
  }
}

export const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
