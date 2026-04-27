import prisma from "../../config/db.js";

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
