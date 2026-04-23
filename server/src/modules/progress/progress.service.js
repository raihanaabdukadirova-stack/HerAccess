import prisma from "../../config/db.js";

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export async function saveLesson(userId, { subjectKey, levelId, score }) {
  // upsert — если уже проходил этот уровень, обновляем score
  return prisma.lessonProgress.upsert({
    where: { userId_subjectKey_levelId: { userId, subjectKey, levelId } },
    update: { score, completedAt: new Date() },
    create: { userId, subjectKey, levelId, score },
  });
}

export async function getLessons(userId) {
  return prisma.lessonProgress.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
  });
}

// ─── Mistakes ─────────────────────────────────────────────────────────────────

export async function saveMistake(userId, { subject, topic, question, correct, given }) {
  return prisma.mistake.create({
    data: { userId, subject, topic, question, correct, given },
  });
}

export async function getMistakes(userId, limit = 20) {
  return prisma.mistake.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getWeakTopics(userId, limit = 6) {
  // Группируем ошибки по subject+topic и считаем количество
  const grouped = await prisma.mistake.groupBy({
    by: ["subject", "topic"],
    where: { userId },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    topic: `${g.subject}:${g.topic}`,
    count: g._count.id,
  }));
}

// ─── Test Scores ──────────────────────────────────────────────────────────────

export async function saveTestScore(userId, { type, score, total, section }) {
  return prisma.testScore.create({
    data: { userId, type, score, total, section: section ?? null },
  });
}

export async function getTestScores(userId, limit = 10) {
  return prisma.testScore.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── Dashboard summary (всё сразу одним запросом) ─────────────────────────────

export async function getDashboard(userId) {
  const [lessons, mistakes, testScores, weakTopics] = await Promise.all([
    getLessons(userId),
    getMistakes(userId, 5),
    getTestScores(userId, 6),
    getWeakTopics(userId, 6),
  ]);

  return { lessons, mistakes, testScores, weakTopics };
}
