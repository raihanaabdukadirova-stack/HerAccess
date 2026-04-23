import { useState } from "react";
import { authApi, setAccessToken } from "../utils/api.js";

export default function AuthPage({ mode, setPage, setUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // Сбрасываем ошибку поля при вводе
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    if (serverError) setServerError("");
  }

  async function submit() {
    // Базовая клиентская валидация
    const next = {};
    if (mode === "register" && !form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    if (mode === "register" && form.password && form.password.length < 8)
      next.password = "Password must be at least 8 characters.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const data =
        mode === "register"
          ? await authApi.register({ name: form.name, email: form.email, password: form.password })
          : await authApi.login({ email: form.email, password: form.password });

      // Сохраняем access token в памяти
      setAccessToken(data.accessToken);
      // Передаём пользователя в App
      setUser(data.user);
      setPage("dashboard");
    } catch (err) {
      // Ошибки валидации с сервера (422)
      if (err.status === 422 && err.validationErrors) {
        const mapped = {};
        err.validationErrors.forEach(({ path, msg }) => {
          mapped[path] = msg;
        });
        setErrors(mapped);
      } else {
        setServerError(err.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div
          style={{
            width: 46, height: 46,
            background: "linear-gradient(135deg,#6d28d9,#db2777)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 20, margin: "0 auto 14px",
          }}
        >
          💜
        </div>

        <h2
          style={{
            fontFamily: "'Lora',serif", fontSize: 24, fontWeight: 700,
            textAlign: "center", marginBottom: 5,
          }}
        >
          {mode === "login" ? "Welcome back" : "Join Her Access"}
        </h2>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--g400)", marginBottom: 26 }}>
          {mode === "login" ? "Sign in to continue" : "Free education for every girl"}
        </p>

        {/* Серверная ошибка */}
        {serverError && (
          <div
            style={{
              background: "#fef2f2", border: "1px solid #fca5a5",
              borderRadius: 8, padding: "10px 13px",
              fontSize: 13, color: "#b91c1c", marginBottom: 14,
            }}
          >
            {serverError}
          </div>
        )}

        {/* Name — только для регистрации */}
        {mode === "register" && (
          <div className="afield">
            <label>Your Name</label>
            <input
              placeholder="e.g. Fatima"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={errors.name ? { borderColor: "#dc2626" } : {}}
            />
            {errors.name && <FieldError msg={errors.name} />}
          </div>
        )}

        {/* Email */}
        <div className="afield">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={errors.email ? { borderColor: "#dc2626" } : {}}
          />
          {errors.email && <FieldError msg={errors.email} />}
        </div>

        {/* Password */}
        <div className="afield">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={errors.password ? { borderColor: "#dc2626" } : {}}
          />
          {errors.password && <FieldError msg={errors.password} />}
          {mode === "register" && !errors.password && (
            <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>
              Min 8 characters, one uppercase letter, one number.
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className="btn btn-p"
          style={{
            width: "100%", borderRadius: 12, justifyContent: "center",
            opacity: loading ? 0.7 : 1, marginTop: 4,
          }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Spinner /> {mode === "login" ? "Signing in…" : "Creating account…"}
            </span>
          ) : mode === "login" ? "Sign In" : "Create Free Account"}
        </button>

        {/* Switch mode */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--g600)" }}>
          {mode === "login" ? (
            <>
              No account?{" "}
              <span
                style={{ color: "var(--p)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setErrors({}); setServerError(""); setPage("register"); }}
              >
                Sign up free
              </span>
            </>
          ) : (
            <>
              Have account?{" "}
              <span
                style={{ color: "var(--p)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setErrors({}); setServerError(""); setPage("login"); }}
              >
                Sign in
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Маленькие вспомогательные компоненты ────────────────────────────────────

function FieldError({ msg }) {
  return (
    <div style={{ fontSize: 11.5, color: "#dc2626", marginTop: 4 }}>{msg}</div>
  );
}

function Spinner() {
  return (
    <svg
      width="14" height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
