import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";

const SALT_ROUNDS = 12;

// ─── Получить профиль + статистику ───────────────────────────────────────────

export async function getProfile(userId) {
  const [user, lessonCount, mistakeCount, testCount, sessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.lessonProgress.count({ where: { userId } }),
    prisma.mistake.count({ where: { userId } }),
    prisma.testScore.count({ where: { userId } }),
    prisma.refreshToken.findMany({
      where: { userId },
      select: { id: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user,
    stats: {
      lessonsCompleted: lessonCount,
      mistakesLogged: mistakeCount,
      testsTaken: testCount,
    },
    sessions,
  };
}

// ─── Обновить имя ─────────────────────────────────────────────────────────────

export async function updateName(userId, name) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });
}

// ─── Сменить пароль ───────────────────────────────────────────────────────────

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    const err = new Error("Current password is incorrect.");
    err.status = 401;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Инвалидируем все сессии после смены пароля
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

// ─── Удалить сессию ───────────────────────────────────────────────────────────

export async function deleteSession(userId, sessionId) {
  // Проверяем что сессия принадлежит этому пользователю
  const session = await prisma.refreshToken.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    const err = new Error("Session not found.");
    err.status = 404;
    throw err;
  }

  await prisma.refreshToken.delete({ where: { id: sessionId } });
}

// ─── Удалить аккаунт ──────────────────────────────────────────────────────────

export async function deleteAccount(userId, password) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Password is incorrect.");
    err.status = 401;
    throw err;
  }

  // Cascade удалит все связанные данные (progress, mistakes, tokens)
  await prisma.user.delete({ where: { id: userId } });
}
