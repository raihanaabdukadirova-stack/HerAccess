import prisma from "../../config/db.js";
import { refreshMaintenanceCache } from "../../middleware/maintenance.js";

// ─── Получить все тесты ───────────────────────────────────────────────────────

export async function getAllTests() {
  return prisma.test.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Получить один тест с вопросами ───────────────────────────────────────────

export async function getTestById(testId) {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      creator: { select: { name: true, email: true } },
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!test) {
    const err = new Error("Test not found.");
    err.status = 404;
    throw err;
  }

  return test;
}

// ─── Создать новый тест ───────────────────────────────────────────────────────

export async function createTest(userId, data) {
  const { title, type, description, timeLimit, isPublished = false, questions = [] } = data;

  return prisma.test.create({
    data: {
      title,
      type,
      description,
      timeLimit,
      isPublished,
      createdBy: userId,
      questions: {
        create: questions.map((q, idx) => ({
          orderIndex: q.orderIndex ?? idx,
          type: q.type,
          section: q.section,
          questionText: q.questionText,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });
}

// ─── Обновить тест ────────────────────────────────────────────────────────────

export async function updateTest(testId, data) {
  const { title, type, description, timeLimit, isPublished } = data;

  return prisma.test.update({
    where: { id: testId },
    data: { title, type, description, timeLimit, isPublished },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });
}

// ─── Удалить тест ─────────────────────────────────────────────────────────────

export async function deleteTest(testId) {
  // CASCADE автоматически удалит все вопросы
  await prisma.test.delete({ where: { id: testId } });
}

// ─── Управление вопросами ─────────────────────────────────────────────────────

export async function addQuestion(testId, data) {
  const { orderIndex, type, section, questionText, options, correctAnswer, explanation } = data;

  return prisma.question.create({
    data: {
      testId,
      orderIndex,
      type,
      section,
      questionText,
      options: options ?? null,
      correctAnswer,
      explanation,
    },
  });
}

export async function updateQuestion(questionId, data) {
  const { orderIndex, type, section, questionText, options, correctAnswer, explanation } = data;

  return prisma.question.update({
    where: { id: questionId },
    data: { orderIndex, type, section, questionText, options, correctAnswer, explanation },
  });
}

export async function deleteQuestion(questionId) {
  await prisma.question.delete({ where: { id: questionId } });
}

// ─── Публикация теста ─────────────────────────────────────────────────────────

export async function publishTest(testId, isPublished) {
  return prisma.test.update({
    where: { id: testId },
    data: { isPublished },
  });
}

// ─── Dashboard stats (§2.1) ───────────────────────────────────────────────────

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export async function getDashboardStats() {
  const today = startOfToday();
  const weekAgo = daysAgo(7);
  const fortnightAgo = daysAgo(14);

  const [
    userTotal,
    userNewToday,
    userNewThisWeek,
    lessonTotal,
    lessonsToday,
    mistakeTotal,
    mistakesToday,
    testTotal,
    testAgg,
    aiTotal,
    aiToday,
    aiAnonToday,
    aiAuthToday,
    activeLessons,
    activeMistakes,
    activeAi,
    topSubjectsRaw,
    topWeakRaw,
    registrationsRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lessonProgress.count(),
    prisma.lessonProgress.count({ where: { completedAt: { gte: today } } }),
    prisma.mistake.count(),
    prisma.mistake.count({ where: { createdAt: { gte: today } } }),
    prisma.testScore.count(),
    prisma.testScore.aggregate({ _avg: { score: true, total: true } }),
    prisma.aILog.count(),
    prisma.aILog.count({ where: { createdAt: { gte: today } } }),
    prisma.aILog.count({ where: { createdAt: { gte: today }, userId: null } }),
    prisma.aILog.count({ where: { createdAt: { gte: today }, userId: { not: null } } }),
    prisma.lessonProgress.findMany({
      where: { completedAt: { gte: today } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.mistake.findMany({
      where: { createdAt: { gte: today } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.aILog.findMany({
      where: { createdAt: { gte: today }, userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.lessonProgress.groupBy({
      by: ["subjectKey"],
      _count: { _all: true },
      orderBy: { _count: { subjectKey: "desc" } },
      take: 5,
    }),
    prisma.mistake.groupBy({
      by: ["subject", "topic"],
      _count: { _all: true },
      orderBy: { _count: { topic: "desc" } },
      take: 5,
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: fortnightAgo } },
      select: { createdAt: true },
    }),
  ]);

  const activeIds = new Set([
    ...activeLessons.map((r) => r.userId),
    ...activeMistakes.map((r) => r.userId),
    ...activeAi.map((r) => r.userId).filter(Boolean),
  ]);

  let avgScorePct = 0;
  if (testAgg._avg.score && testAgg._avg.total) {
    avgScorePct = Math.round((testAgg._avg.score / testAgg._avg.total) * 1000) / 10;
  }

  // Заполняем 14 дней подряд, чтобы дни без регистраций давали 0
  const buckets = new Map();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const u of registrationsRaw) {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  }
  const registrationsByDay = [...buckets.entries()].map(([date, count]) => ({ date, count }));

  return {
    users: {
      total: userTotal,
      newToday: userNewToday,
      newThisWeek: userNewThisWeek,
      activeToday: activeIds.size,
    },
    lessons: {
      completedTotal: lessonTotal,
      completedToday: lessonsToday,
    },
    mistakes: {
      total: mistakeTotal,
      todayTotal: mistakesToday,
    },
    tests: {
      total: testTotal,
      avgScore: avgScorePct,
    },
    aiRequests: {
      total: aiTotal,
      today: aiToday,
      anonToday: aiAnonToday,
      authToday: aiAuthToday,
    },
    topSubjects: topSubjectsRaw.map((r) => ({
      subjectKey: r.subjectKey,
      count: r._count._all,
    })),
    topWeakTopics: topWeakRaw.map((r) => ({
      topic: `${r.subject}:${r.topic}`,
      count: r._count._all,
    })),
    registrationsByDay,
  };
}

// ─── Users management (§2.2) ──────────────────────────────────────────────────

const USER_PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  banned: true,
  bannedAt: true,
  banReason: true,
  createdAt: true,
  updatedAt: true,
};

const SORTABLE = new Set(["createdAt", "name", "email", "role"]);

export async function listUsers({ page = 1, limit = 20, search = "", role = "", sort = "createdAt", order = "desc" }) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;
  const sortField = SORTABLE.has(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role === "STUDENT" || role === "ADMIN") where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        ...USER_PUBLIC_FIELDS,
        _count: {
          select: { progress: true, mistakes: true, testScores: true },
        },
      },
      orderBy: { [sortField]: sortOrder },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  // Last activity per user — самая поздняя дата из progress.completedAt / mistake.createdAt / testScore.createdAt
  const ids = users.map((u) => u.id);
  const lastActiveMap = new Map();
  if (ids.length) {
    const [lessons, mistakes, scores] = await Promise.all([
      prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _max: { completedAt: true },
      }),
      prisma.mistake.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _max: { createdAt: true },
      }),
      prisma.testScore.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _max: { createdAt: true },
      }),
    ]);

    for (const r of lessons) {
      if (r._max.completedAt) lastActiveMap.set(r.userId, r._max.completedAt);
    }
    for (const r of mistakes) {
      const cur = lastActiveMap.get(r.userId);
      if (r._max.createdAt && (!cur || r._max.createdAt > cur)) {
        lastActiveMap.set(r.userId, r._max.createdAt);
      }
    }
    for (const r of scores) {
      const cur = lastActiveMap.get(r.userId);
      if (r._max.createdAt && (!cur || r._max.createdAt > cur)) {
        lastActiveMap.set(r.userId, r._max.createdAt);
      }
    }
  }

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      banned: u.banned,
      bannedAt: u.bannedAt,
      banReason: u.banReason,
      createdAt: u.createdAt,
      stats: {
        lessonsCompleted: u._count.progress,
        testsTaken: u._count.testScores,
        mistakesLogged: u._count.mistakes,
        lastActive: lastActiveMap.get(u.id) ?? null,
      },
    })),
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      pages: Math.max(1, Math.ceil(total / take)),
    },
  };
}

async function getUserOrThrow(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_PUBLIC_FIELDS,
  });
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return user;
}

export async function getUserDetail(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...USER_PUBLIC_FIELDS,
      _count: {
        select: { progress: true, mistakes: true, testScores: true, aiLogs: true },
      },
    },
  });
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return {
    ...user,
    stats: {
      lessonsCompleted: user._count.progress,
      testsTaken: user._count.testScores,
      mistakesLogged: user._count.mistakes,
      aiRequests: user._count.aiLogs,
    },
  };
}

export async function updateUserRole(adminId, targetId, role) {
  if (adminId === targetId) {
    const err = new Error("You cannot change your own role.");
    err.status = 400;
    throw err;
  }
  await getUserOrThrow(targetId);
  return prisma.user.update({
    where: { id: targetId },
    data: { role },
    select: USER_PUBLIC_FIELDS,
  });
}

export async function setUserBan(adminId, targetId, banned, reason) {
  if (adminId === targetId) {
    const err = new Error("You cannot ban yourself.");
    err.status = 400;
    throw err;
  }
  await getUserOrThrow(targetId);

  const data = banned
    ? { banned: true, bannedAt: new Date(), banReason: reason ?? null }
    : { banned: false, bannedAt: null, banReason: null };

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data,
      select: USER_PUBLIC_FIELDS,
    }),
    // При бане — выбиваем все refresh-токены, чтобы пользователь вылетел
    ...(banned ? [prisma.refreshToken.deleteMany({ where: { userId: targetId } })] : []),
  ]);

  return user;
}

export async function deleteUser(adminId, targetId) {
  if (adminId === targetId) {
    const err = new Error("You cannot delete your own account here.");
    err.status = 400;
    throw err;
  }
  await getUserOrThrow(targetId);
  await prisma.user.delete({ where: { id: targetId } });
}

export async function getUserProgress(id) {
  await getUserOrThrow(id);

  const [lessons, mistakes, testScores] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: id },
      orderBy: { completedAt: "desc" },
    }),
    prisma.mistake.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.testScore.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { lessons, mistakes, testScores };
}

export async function resetUserProgress(id) {
  await getUserOrThrow(id);
  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({ where: { userId: id } }),
    prisma.mistake.deleteMany({ where: { userId: id } }),
    prisma.testScore.deleteMany({ where: { userId: id } }),
  ]);
}

// ─── System settings (§2.5) ───────────────────────────────────────────────────

export const SETTINGS_DEFAULTS = {
  anonChatLimit: 5,
  authChatLimit: 30,
  registrationEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "Site is under maintenance. Please check back later.",
  geminiModel: "gemini-2.0-flash",
  maxQuizQuestions: 10,
  featuredExamId: null,
};

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-flash"];

const SETTINGS_VALIDATORS = {
  anonChatLimit: (v) => Number.isInteger(v) && v >= 0 && v <= 1000,
  authChatLimit: (v) => Number.isInteger(v) && v >= 0 && v <= 10000,
  registrationEnabled: (v) => typeof v === "boolean",
  maintenanceMode: (v) => typeof v === "boolean",
  maintenanceMessage: (v) => typeof v === "string" && v.length <= 500,
  geminiModel: (v) => typeof v === "string" && GEMINI_MODELS.includes(v),
  maxQuizQuestions: (v) => Number.isInteger(v) && v >= 1 && v <= 50,
  featuredExamId: (v) => v === null || (typeof v === "string" && v.length > 0),
};

const MAINTENANCE_KEYS = new Set(["maintenanceMode", "maintenanceMessage"]);

export async function getSettings() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: Object.keys(SETTINGS_DEFAULTS) } },
  });

  const out = { ...SETTINGS_DEFAULTS };
  for (const r of rows) {
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      // на сломанной записи остаётся дефолт
    }
  }
  return { settings: out, geminiModelOptions: GEMINI_MODELS };
}

export async function updateSettings(adminId, body) {
  if (!body || typeof body !== "object") {
    const err = new Error("Settings body must be an object.");
    err.status = 400;
    throw err;
  }

  const entries = Object.entries(body);
  if (entries.length === 0) {
    const err = new Error("Nothing to update.");
    err.status = 400;
    throw err;
  }

  for (const [key, value] of entries) {
    const check = SETTINGS_VALIDATORS[key];
    if (!check) {
      const err = new Error(`Unknown setting: ${key}.`);
      err.status = 400;
      throw err;
    }
    if (!check(value)) {
      const err = new Error(`Invalid value for "${key}".`);
      err.status = 400;
      throw err;
    }
  }

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(value), updatedBy: adminId },
        create: { key, value: JSON.stringify(value), updatedBy: adminId },
      })
    )
  );

  // Если меняли maintenance — сбрасываем кеш мидлвара,
  // иначе он держит старое значение до 60s
  if (entries.some(([k]) => MAINTENANCE_KEYS.has(k))) {
    await refreshMaintenanceCache().catch(() => {});
  }

  return getSettings();
}
