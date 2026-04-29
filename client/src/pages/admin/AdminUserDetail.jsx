import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi.js';

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

function ConfirmInline({ title, text, confirmLabel, danger, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{text}</p>
        {err && <div style={{ color: '#b91c1c', fontSize: 12 }}>{err}</div>}
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await onConfirm();
              } catch (e) {
                setErr(e.message || 'Failed.');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserDetail({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [{ user: u }, p] = await Promise.all([
        adminApi.getUserById(userId),
        adminApi.getUserProgress(userId),
      ]);
      setUser(u);
      setProgress(p);
    } catch (e) {
      setError(e.message || 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div>
        <button className="admin-btn admin-btn-ghost" onClick={onBack}>
          ← Back to Users
        </button>
        <div className="admin-card" style={{ marginTop: 14, color: 'var(--g400)' }}>
          Loading…
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <button className="admin-btn admin-btn-ghost" onClick={onBack}>
          ← Back to Users
        </button>
        <div
          className="admin-card"
          style={{ marginTop: 14, borderColor: '#fca5a5', color: '#b91c1c' }}
        >
          {error || 'User not found.'}
        </div>
      </div>
    );
  }

  const { lessons, mistakes, testScores } = progress;

  return (
    <div>
      <button className="admin-btn admin-btn-ghost" onClick={onBack}>
        ← Back to Users
      </button>

      <div className="admin-card" style={{ marginTop: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#6d28d9,#db2777)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Lora',serif",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: "'Lora',serif", fontSize: 19, fontWeight: 700 }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--g600)' }}>{user.email}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span
                className={`admin-badge ${
                  user.role === 'ADMIN' ? 'admin-badge-info' : 'admin-badge-ok'
                }`}
              >
                {user.role}
              </span>
              {user.banned ? (
                <span className="admin-badge admin-badge-err" title={user.banReason || ''}>
                  BANNED
                </span>
              ) : (
                <span className="admin-badge admin-badge-ok">ACTIVE</span>
              )}
            </div>
            {user.banned && user.banReason && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>
                Reason: {user.banReason}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--g400)' }}>
              Joined {fmtDate(user.createdAt)}
            </div>
          </div>
          <div>
            <button className="admin-btn admin-btn-danger" onClick={() => setResetOpen(true)}>
              Reset All Progress
            </button>
          </div>
        </div>
      </div>

      <div className="admin-metric-grid">
        <div className="admin-metric">
          <div className="admin-metric-icon">📚</div>
          <div className="admin-metric-value">{user.stats.lessonsCompleted}</div>
          <div className="admin-metric-label">Lessons</div>
        </div>
        <div className="admin-metric">
          <div className="admin-metric-icon">🎯</div>
          <div className="admin-metric-value">{user.stats.testsTaken}</div>
          <div className="admin-metric-label">Tests</div>
        </div>
        <div className="admin-metric">
          <div className="admin-metric-icon">❌</div>
          <div className="admin-metric-value">{user.stats.mistakesLogged}</div>
          <div className="admin-metric-label">Mistakes</div>
        </div>
        <div className="admin-metric">
          <div className="admin-metric-icon">🤖</div>
          <div className="admin-metric-value">{user.stats.aiRequests}</div>
          <div className="admin-metric-label">AI Requests</div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, marginBottom: 14 }}>
        <div className="admin-card-title" style={{ padding: '14px 18px 0' }}>
          Completed lessons
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Level</th>
                <th>Score</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--g400)', textAlign: 'center' }}>
                    No lessons yet.
                  </td>
                </tr>
              ) : (
                lessons.map((l) => (
                  <tr key={l.id}>
                    <td>{l.subjectKey}</td>
                    <td>{l.levelId}</td>
                    <td>{l.score}</td>
                    <td>{fmtDate(l.completedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, marginBottom: 14 }}>
        <div className="admin-card-title" style={{ padding: '14px 18px 0' }}>
          Recent mistakes
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Question</th>
                <th>Correct</th>
                <th>Given</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--g400)', textAlign: 'center' }}>
                    No mistakes logged.
                  </td>
                </tr>
              ) : (
                mistakes.map((m) => (
                  <tr key={m.id}>
                    <td>{m.subject}</td>
                    <td>{m.topic}</td>
                    <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.question}
                    </td>
                    <td>{m.correct}</td>
                    <td style={{ color: '#b91c1c' }}>{m.given}</td>
                    <td>{fmtDate(m.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-card-title" style={{ padding: '14px 18px 0' }}>
          Test scores
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Section</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {testScores.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--g400)', textAlign: 'center' }}>
                    No test scores yet.
                  </td>
                </tr>
              ) : (
                testScores.map((t) => (
                  <tr key={t.id}>
                    <td>{t.type}</td>
                    <td>{t.section || '—'}</td>
                    <td>
                      {t.score}/{t.total}
                    </td>
                    <td>{fmtDate(t.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {resetOpen && (
        <ConfirmInline
          title={`Reset progress for ${user.name}?`}
          text="All lessons, mistakes and test scores will be erased. This cannot be undone."
          confirmLabel="Reset Progress"
          danger
          onClose={() => setResetOpen(false)}
          onConfirm={async () => {
            await adminApi.resetUserProgress(user.id);
            setResetOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}
