import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { jwtConfig, expiresInMs } from "../../config/jwt.js";

const SALT_ROUNDS = 12;

// ─── Token helpers ────────────────────────────────────────────────────────────

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
}

async function createRefreshToken(userId) {
  const token = jwt.sign(
    { sub: userId },
    jwtConfig.refresh.secret,
    { expiresIn: jwtConfig.refresh.expiresIn }
  );

  const expiresAt = new Date(Date.now() + expiresInMs(jwtConfig.refresh.expiresIn));

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });

  return token;
}

// ─── Auth operations ──────────────────────────────────────────────────────────

export async function register({ name, email, password }) {
  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email is already registered.");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Use constant-time compare to avoid timing attacks even when user not found
  const hash = user?.passwordHash ?? "$2b$12$invalidhashfortimingresilience";
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  if (user.banned) {
    const err = new Error(user.banReason || "Your account has been suspended.");
    err.status = 403;
    err.code = "ACCOUNT_BANNED";
    throw err;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function refresh(incomingToken) {
  // Verify JWT signature & expiry
  let payload;
  try {
    payload = jwt.verify(incomingToken, jwtConfig.refresh.secret);
  } catch {
    const err = new Error("Invalid or expired refresh token.");
    err.status = 401;
    throw err;
  }

  // Check token exists in DB (not rotated/revoked)
  const stored = await prisma.refreshToken.findUnique({
    where: { token: incomingToken },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error("Refresh token revoked or expired.");
    err.status = 401;
    throw err;
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const accessToken = signAccessToken(stored.user);
  const newRefreshToken = await createRefreshToken(stored.user.id);

  return { user: stored.user, accessToken, refreshToken: newRefreshToken };
}

export async function logout(incomingToken) {
  // Silently succeed even if token doesn't exist
  await prisma.refreshToken.deleteMany({ where: { token: incomingToken } });
}

export async function logoutAll(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function getMe(userId) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return user;
}
