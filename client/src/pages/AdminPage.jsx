import '../styles/admin.css';

// Stage 1 placeholder. The full AdminLayout + sub-pages land in Stage 2.
// Old monolithic Test/Question UI was removed; the legacy /api/admin/tests
// endpoints still work and will be replaced by SATExam/SATQuestion in Stage 6.

export default function AdminPage({ user, setPage }) {
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700 }}>
            Access Denied
          </h2>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '8px 0 18px' }}>
            This page requires Admin privileges.
          </p>
          <button className="btn btn-p" onClick={() => setPage('home')}>
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 32, maxWidth: 720 }}>
        <div className="admin-stage-banner">
          <div className="admin-stage-banner-eyebrow">Admin Panel</div>
          <h1>Foundation ready ✓</h1>
          <p>
            Database schema, maintenance gate and ban-check are wired up.
            Layout, dashboard and management screens arrive in Stage 2.
          </p>
          <div className="admin-stage-pill">Signed in as {user.name} · ADMIN</div>
        </div>
      </div>
    </div>
  );
}
