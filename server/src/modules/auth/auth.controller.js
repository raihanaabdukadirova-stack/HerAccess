import * as authService from "./auth.service.js";

// Helper: attach refresh token as HttpOnly cookie
function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    path: "/api/auth", // cookie only sent to auth routes
  });
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

// POST /api/auth/register
export async function registerController(req, res) {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    name,
    email,
    password,
  });

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    user,
    accessToken,
  });
}

// POST /api/auth/login
export async function loginController(req, res) {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  setRefreshCookie(res, refreshToken);

  res.json({ user, accessToken });
}

// POST /api/auth/refresh
export async function refreshController(req, res) {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  const { user, accessToken, refreshToken } = await authService.refresh(token);

  setRefreshCookie(res, refreshToken);

  res.json({ user, accessToken });
}

// POST /api/auth/logout
export async function logoutController(req, res) {
  const token = req.cookies?.refreshToken;

  if (token) {
    await authService.logout(token);
  }

  clearRefreshCookie(res);

  res.json({ message: "Logged out." });
}

// POST /api/auth/logout-all  (requires auth)
export async function logoutAllController(req, res) {
  await authService.logoutAll(req.user.id);
  clearRefreshCookie(res);
  res.json({ message: "Logged out from all devices." });
}

// GET /api/auth/me  (requires auth)
export async function getMeController(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
}
