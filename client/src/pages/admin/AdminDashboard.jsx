import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi.js';

const fmt = (n) => (n ?? 0).toLocaleString('en-US');

function MetricTile({ icon, label, value, sub }) {
  return (
    <div className="admin-metric">
      <div className="admin-metric-icon">{icon}</div>
      <div className="admin-metric-value">{fmt(value)}</div>
      <div className="admin-metric-label">{label}</div>
      {sub && <div className="admin-metric-sub">{sub}</div>}
    </div>
  );
}

function RegistrationsChart({ data }) {
  if (!data?.length) return <div style={{ color: 'var(--g400)', fontSize: 13 }}>No data.</div>;
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
      {data.map((d) => {
        const h = (d.count / max) * 100;
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count}`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <div
              style={{
                width: '100%',
                height: `${Math.max(2, h)}%`,
                background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                borderRadius: '4px 4px 0 0',
                transition: 'height .25s',
              }}
            />
            <div style={{ fontSize: 9, color: 'var(--g400)' }}>{d.date.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );
}

function HBarRow({ label, count, max }) {
  const pct = max ? Math.max(4, (count / max) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px', gap: 10, alignItems: 'center', padding: '6px 0' }}>
      <div style={{ fontSize: 12.5, color: 'var(--g800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ height: 8, background: 'var(--g50)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#6d28d9,#db2777)' }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g600)', textAlign: 'right' }}>{fmt(count)}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getStats()
      .then((data) => alive && setStats(data))
      .catch((e) => alive && setError(e.message || 'Failed to load stats.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="admin-page-head">
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: '#b91c1c' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxSubject = Math.max(1, ...stats.topSubjects.map((s) => s.count));
  const maxWeak = Math.max(1, ...stats.topWeakTopics.map((s) => s.count));

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Live snapshot of platform activity.</p>
        </div>
      </div>

      <div className="admin-metric-grid">
        <MetricTile
          icon="👥"
          label="Total Users"
          value={stats.users.total}
          sub={`+${fmt(stats.users.newToday)} today · +${fmt(stats.users.newThisWeek)} this week`}
        />
        <MetricTile
          icon="📚"
          label="Lessons"
          value={stats.lessons.completedTotal}
          sub={`${fmt(stats.lessons.completedToday)} completed today`}
        />
        <MetricTile
          icon="🤖"
          label="AI Requests"
          value={stats.aiRequests.total}
          sub={`${fmt(stats.aiRequests.today)} today (${fmt(stats.aiRequests.anonToday)} anon · ${fmt(
            stats.aiRequests.authToday
          )} auth)`}
        />
        <MetricTile
          icon="❌"
          label="Mistakes Logged"
          value={stats.mistakes.total}
          sub={`${fmt(stats.mistakes.todayTotal)} today`}
        />
        <MetricTile
          icon="🎯"
          label="Tests Taken"
          value={stats.tests.total}
          sub={`Avg score ${stats.tests.avgScore || 0}%`}
        />
        <MetricTile icon="🟢" label="Active Today" value={stats.users.activeToday} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="admin-card">
          <div className="admin-card-title">Registrations · last 14 days</div>
          <RegistrationsChart data={stats.registrationsByDay} />
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Top subjects</div>
          {stats.topSubjects.length === 0 ? (
            <div style={{ color: 'var(--g400)', fontSize: 13 }}>No lessons completed yet.</div>
          ) : (
            stats.topSubjects.map((s) => (
              <HBarRow key={s.subjectKey} label={s.subjectKey} count={s.count} max={maxSubject} />
            ))
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Top weak topics</div>
        {stats.topWeakTopics.length === 0 ? (
          <div style={{ color: 'var(--g400)', fontSize: 13 }}>No mistakes logged yet.</div>
        ) : (
          stats.topWeakTopics.map((t) => (
            <HBarRow key={t.topic} label={t.topic} count={t.count} max={maxWeak} />
          ))
        )}
      </div>
    </div>
  );
}
