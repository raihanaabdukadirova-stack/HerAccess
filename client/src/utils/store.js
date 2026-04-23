export const STORE = {
  user: null,
  mistakes: [],
  completedLessons: [],
  testScores: [],
  weakTopics: {},
};

export function recordMistake(subject, topic, question, correct, given) {
  STORE.mistakes.push({
    id: Date.now(),
    subject,
    topic,
    question,
    correct,
    given,
    timestamp: new Date().toISOString(),
  });
  const key = `${subject}:${topic}`;
  STORE.weakTopics[key] = (STORE.weakTopics[key] || 0) + 1;
}

export function recordLesson(subjectKey, levelId, score) {
  STORE.completedLessons.push({
    subjectKey,
    levelId,
    score,
    date: new Date().toISOString(),
  });
}

export function recordTestScore(type, score, total, section = "") {
  STORE.testScores.push({
    type,
    score,
    total,
    section,
    date: new Date().toISOString(),
  });
}

export function getWeakTopics(limit = 5) {
  return Object.entries(STORE.weakTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => ({ topic: k, count: v }));
}
