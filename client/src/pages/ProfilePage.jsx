import { useState, useEffect } from "react";
import { profileApi } from "../utils/profileApi.js";
import { authApi, clearAccessToken } from "../utils/api.js";
import { STORE } from "../utils/store.js";

export default function ProfilePage({ user, setUser, setPage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    profileApi.getProfile()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Сохранить имя ────────────────────────────────────────────────────────────
  async function saveName() {
    if (!nameVal.trim()) { setNameError("Name is required."); return; }
    setNameLoading(true); setNameError("");
    try {
      const { user: updated } = await profileApi.updateName(nameVal.trim());
      STORE.user = updated;
      setUser(updated);
      setData((d) => ({ ...d, user: updated }));
      setEditingName(false);
    } catch (err) {
      setNameError(err.message);
    } finally {
      setNameLoading(false);
    }
  }

  // ── Сменить пароль ───────────────────────────────────────────────────────────
  async function changePassword() {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError("Both fields are required."); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters."); return;
    }
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      await profileApi.changePassword(pwForm);
      // Немедленно инвалидируем токен — сервер уже удалил все сессии
      clearAccessToken();
      setPwSuccess("Password changed. Please log in again.");
      setPwForm({ currentPassword: "", newPassword: "" });
      setTimeout(() => {
        STORE.user = null;
        setUser(null);
        setPage("login");
      }, 2000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  }

  // ── Удалить сессию ───────────────────────────────────────────────────────────
  async function removeSession(sessionId) {
    try {
      await profileApi.deleteSession(sessionId);
      setData((d) => ({
        ...d,
        sessions: d.sessions.filter((s) => s.id !== sessionId),
      }));
    } catch {}
  }

  // ── Отозвать все остальные сессии ────────────────────────────────────────────
  async function revokeAllOtherSessions() {
    try {
      await authApi.logoutAll();
      // Оставляем только первую запись (текущая сессия) в UI
      setData((d) => ({ ...d, sessions: d.sessions.slice(0, 1) }));
    } catch {}
  }

  // ── Удалить аккаунт ──────────────────────────────────────────────────────────
  async function deleteAccount() {
    if (!deletePassword) { setDeleteError("Enter your password."); return; }
    setDeleteLoading(true); setDeleteError("");
    try {
      await profileApi.deleteAccount(deletePassword);
      clearAccessToken();
      STORE.user = null;
      setUser(null);
      setPage("home");
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="lds"><div className="ld" /><div className="ld" /><div className="ld" /></div>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--g400)" }}>
      Could not load profile.
    </div>
  );

  const { user: u, stats, sessions } = data;
  const initials = u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28, maxWidth: 680 }}>

        {/* ── Аватар + имя ── */}
        <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#6d28d9,#db2777)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'Lora',serif",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  style={{
                    border: "2px solid var(--p2)", borderRadius: 9,
                    padding: "7px 11px", fontSize: 14, fontFamily: "'Outfit',sans-serif",
                    outline: "none", flex: 1, minWidth: 140,
                  }}
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  autoFocus
                />
                <button className="btn-sm bsp" onClick={saveName} disabled={nameLoading}>
                  {nameLoading ? "Saving…" : "Save"}
                </button>
                <button className="btn-sm bso" onClick={() => setEditingName(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 700 }}>{u.name}</div>
                <button
                  onClick={() => { setNameVal(u.name); setEditingName(true); setNameError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--p)" }}
                  title="Edit name"
                >
                  ✏️
                </button>
              </div>
            )}
            {nameError && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{nameError}</div>}
            <div style={{ fontSize: 13, color: "var(--g400)", marginTop: 3 }}>{u.email}</div>
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 999,
              background: u.role === "ADMIN" ? "linear-gradient(135deg,#6d28d9,#db2777)" : "var(--p4)",
              color: u.role === "ADMIN" ? "#fff" : "var(--p)",
              textTransform: "uppercase", letterSpacing: 0.5, display: "inline-block", marginTop: 6,
            }}>
              {u.role}
            </span>
          </div>
        </div>

        {/* ── Статистика ── */}
        <div className="g2" style={{ marginBottom: 16 }}>
          {[
            ["📚", stats.lessonsCompleted, "Lessons Completed"],
            ["📝", stats.testsTaken,       "Tests Taken"],
            ["❌", stats.mistakesLogged,   "Mistakes Logged"],
            ["📅", new Date(u.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" }), "Member Since"],
          ].map(([icon, val, label]) => (
            <div key={label} className="dstat">
              <div className="dsv" style={{ fontSize: 22 }}>{icon} {val}</div>
              <div className="dsl">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Смена пароля ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            className="shed"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => { setShowPassword((v) => !v); setPwError(""); setPwSuccess(""); }}
          >
            🔑 Change Password
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--g400)" }}>
              {showPassword ? "▲" : "▼"}
            </span>
          </div>
          {showPassword && (
            <div style={{ marginTop: 4 }}>
              {pwSuccess && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#15803d", marginBottom: 12 }}>
                  {pwSuccess}
                </div>
              )}
              {pwError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#b91c1c", marginBottom: 12 }}>
                  {pwError}
                </div>
              )}
              <div className="afield">
                <label>Current Password</label>
                <input
                  type="password" placeholder="••••••••"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  disabled={pwLoading}
                />
              </div>
              <div className="afield">
                <label>New Password</label>
                <input
                  type="password" placeholder="Min 8 chars, uppercase, number"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  disabled={pwLoading}
                />
              </div>
              <button className="btn btn-p" style={{ fontSize: 13, padding: "9px 22px" }} onClick={changePassword} disabled={pwLoading}>
                {pwLoading ? "Saving…" : "Update Password"}
              </button>
            </div>
          )}
        </div>

        {/* ── Активные сессии ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="shed">🖥️ Active Sessions <span style={{ fontSize: 12, fontWeight: 400, color: "var(--g400)" }}>({sessions.length})</span></div>
          {sessions.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--g400)" }}>No active sessions.</div>
          )}
          {sessions.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: i < sessions.length - 1 ? "1px solid var(--g100)" : "none",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  Session {i + 1} {i === 0 ? <span style={{ fontSize: 11, background: "var(--p4)", color: "var(--p)", borderRadius: 999, padding: "1px 7px", marginLeft: 6 }}>current</span> : ""}
                </div>
                <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 2 }}>
                  Started {new Date(s.createdAt).toLocaleString()} · Expires {new Date(s.expiresAt).toLocaleDateString()}
                </div>
              </div>
              {i !== 0 && (
                <button
                  onClick={() => removeSession(s.id)}
                  style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 7, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
          {sessions.length > 1 && (
            <button
              className="btn btn-o"
              style={{ marginTop: 12, fontSize: 13, padding: "8px 18px" }}
              onClick={revokeAllOtherSessions}
            >
              Revoke All Other Sessions
            </button>
          )}
        </div>

        {/* ── Удалить аккаунт ── */}
        <div className="card" style={{ marginBottom: 32, border: "1px solid #fca5a5" }}>
          <div className="shed" style={{ color: "#b91c1c" }}>⚠️ Delete Account</div>
          <p style={{ fontSize: 13, color: "var(--g600)", marginBottom: 14, lineHeight: 1.6 }}>
            This will permanently delete your account, all progress, mistakes, and test scores. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 999, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div>
              {deleteError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#b91c1c", marginBottom: 12 }}>
                  {deleteError}
                </div>
              )}
              <div className="afield">
                <label>Confirm with your password</label>
                <input
                  type="password" placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={deleteLoading}
                  style={{ borderColor: "#fca5a5" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ background: "#b91c1c", border: "none", color: "#fff", borderRadius: 999, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  onClick={deleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting…" : "Yes, Delete Account"}
                </button>
                <button className="btn-sm bso" onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); setDeletePassword(""); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
