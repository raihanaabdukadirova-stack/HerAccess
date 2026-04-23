import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

/**
 * Verifies the Bearer access token in the Authorization header.
 * Attaches the decoded payload as req.user = { id, email, role }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, jwtConfig.access.secret);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid access token." });
  }
}

/**
 * Role guard — use after requireAuth.
 * Usage: requireRole("ADMIN")
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }
    next();
  };
}
