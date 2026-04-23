/**
 * Lightweight API client.
 *
 * - Attaches Authorization header automatically
 * - On 401 TOKEN_EXPIRED → silently refreshes access token and retries once
 * - Throws ApiError with { message, status } on non-2xx responses
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// In-memory access token — never persisted to localStorage
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
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
    credentials: "include", // send HttpOnly refresh cookie
  });

  // Silent token refresh on expiry
  if (res.status === 401 && retry) {
    const body = await res.json().catch(() => ({}));
    if (body.code === "TOKEN_EXPIRED") {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request(path, options, false); // retry once
      }
    }
    clearAccessToken();
    // Dispatch custom event so the app can redirect to login
    window.dispatchEvent(new Event("auth:expired"));
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }

  // 204 No Content
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
  get:    (path, opts)   => request(path, { method: "GET",    ...opts }),
  post:   (path, body, opts) => request(path, { method: "POST",   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts) => request(path, { method: "PUT",    body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts) => request(path, { method: "PATCH",  body: JSON.stringify(body), ...opts }),
  delete: (path, opts)   => request(path, { method: "DELETE", ...opts }),
};

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post("/api/auth/register", data),
  login:    (data) => api.post("/api/auth/login", data),
  logout:   ()     => api.post("/api/auth/logout"),
  me:       ()     => api.get("/api/auth/me"),

  // Called on app init to restore session from the HttpOnly cookie
  async restoreSession() {
    const refreshed = await tryRefresh();
    if (!refreshed) return null;
    const { user } = await api.get("/api/auth/me");
    return user;
  },
};
