import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { jwtConfig } from "../config/jwt.js";

const CACHE_TTL_MS = 60_000;

let cache = {
  enabled: false,
  message: "",
  loadedAt: 0,
};

async function loadSettings() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: ["maintenanceMode", "maintenanceMessage"] } },
  });

  const get = (k) => rows.find((r) => r.key === k)?.value;

  let enabled = false;
  let message = "Site is under maintenance. Please check back later.";

  try {
    const v = get("maintenanceMode");
    if (v != null) enabled = JSON.parse(v) === true;
  } catch {}

  try {
    const v = get("maintenanceMessage");
    if (v != null) {
      const parsed = JSON.parse(v);
      if (typeof parsed === "string" && parsed.trim()) message = parsed;
    }
  } catch {}

  cache = { enabled, message, loadedAt: Date.now() };
}

export async function refreshMaintenanceCache() {
  await loadSettings();
}

export async function maintenanceCheck(req, res, next) {
  // Always allow refresh & logout so admins can re-auth and turn off maintenance
  if (
    req.path.startsWith("/auth/refresh") ||
    req.path.startsWith("/auth/logout") ||
    req.path.startsWith("/auth/login")
  ) {
    return next();
  }

  if (Date.now() - cache.loadedAt > CACHE_TTL_MS) {
    try {
      await loadSettings();
    } catch {
      // если БД упала — не блокируем
      return next();
    }
  }

  if (!cache.enabled) return next();

  // ADMIN-пользователи проходят через maintenance
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), jwtConfig.access.secret);
      if (payload.role === "ADMIN") return next();
    } catch {}
  }

  return res.status(503).json({
    error: cache.message,
    code: "MAINTENANCE",
  });
}
