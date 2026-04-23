import { useState } from "react";
import { STORE } from "../utils/store.js";

export default function AuthPage({ mode, setPage, setUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function submit() {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    if (mode === "register" && !form.name) { setError("Please enter your name."); return; }
    const u = { name: form.name || form.email.split("@")[0], email: form.email };
    STORE.user = u;
    setUser(u);
    setPage("dashboard");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
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
        <p
          style={{ textAlign: "center", fontSize: 13, color: "var(--g400)", marginBottom: 26 }}
        >
          {mode === "login" ? "Sign in to continue" : "Free education for every girl"}
        </p>

        {mode === "register" && (
          <div className="afield">
            <label>Your Name</label>
            <input
              placeholder="e.g. Fatima"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        )}
        <div className="afield">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="afield">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        {error && (
          <div style={{ color: "#dc2626", fontSize: 12.5, marginBottom: 10 }}>{error}</div>
        )}
        <button
          className="btn btn-p"
          style={{ width: "100%", borderRadius: 12, justifyContent: "center" }}
          onClick={submit}
        >
          {mode === "login" ? "Sign In" : "Create Free Account"}
        </button>
        <div
          style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--g600)" }}
        >
          {mode === "login" ? (
            <>
              No account?{" "}
              <span
                style={{ color: "var(--p)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => setPage("register")}
              >
                Sign up free
              </span>
            </>
          ) : (
            <>
              Have account?{" "}
              <span
                style={{ color: "var(--p)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => setPage("login")}
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
