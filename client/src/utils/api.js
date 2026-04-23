/**
 * Lightweight API client.
 *
 * - Attaches Authorization header automatically
 * - On 401 TOKEN_EXPIRED → silently refreshes access token and retries once
 * - Throws ApiError with { message, status, validationErrors? } on non-2xx responses
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(message, status, validationErrors = null) {
    super(message);
    this.status = status;
    this.name = "ApiError";
    this.validationErrors = validationErrors; // [{path, msg}] от express-validator
  }
}

// In-memory access token — никогда не в localStorage
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}, retry = true) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // отправляем HttpOnly refresh cookie
  });

  // Тихий рефреш при истёкшем токене
  if (res.status === 401 && retry) {
    const body = await res.json().catch(() => ({}));
    if (body.code === "TOKEN_EXPIRED") {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request(path, options, false); // повторяем один раз
      }
    }
    clearAccessToken();
    window.dispatchEvent(new Event("auth:expired"));
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    // 422 Validation errors от express-validator
    if (res.status === 422 && body.errors) {
      throw new ApiError("Validation failed.", 422, body.errors);
    }

    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }

  if (res.status === 204) return null;

  return res.json();
}

async function tryRefresh() {
  try {
    const data = await request("/api/auth/refresh", { method: "POST" }, false);
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export const api = {
  get:    (path, opts)       => request(path, { method: "GET",    ...opts }),
  post:   (path, body, opts) => request(path, { method: "POST",   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts) => request(path, { method: "PUT",    body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts) => request(path, { method: "PATCH",  body: JSON.stringify(body), ...opts }),
  delete: (path, opts)       => request(path, { method: "DELETE", ...opts }),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post("/api/auth/register", data),
  login:    (data) => api.post("/api/auth/login", data),
  logout:   ()     => api.post("/api/auth/logout"),
  me:       ()     => api.get("/api/auth/me"),

  // Восстановление сессии при загрузке приложения через refresh cookie
  async restoreSession() {
    const refreshed = await tryRefresh();
    if (!refreshed) return null;
    const { user } = await api.get("/api/auth/me");
    return user;
  },
};
