import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi.js';

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

const STATUS_BADGE = {
  ok: 'admin-badge-ok',
  error: 'admin-badge-err',
  rate_limited: 'admin-badge-warn',
};

const STATUS_LABEL = {
  ok: 'OK',
  error: 'ERROR',
  rate_limited: 'LIMIT',
};

export default function AdminAILogs() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAILogs({
        page,
        limit: 50,
        type,
        status,
        userId,
        dateFrom,
        dateTo,
      });
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load AI logs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, status, userId, dateFrom, dateTo]);

  function applyUserId(e) {
    e.preventDefault();
    setPage(1);
    setUserId(userIdInput.trim());
  }

  function resetFilters() {
    setType('');
    setStatus('');
    setUserId('');
    setUserIdInput('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>AI Logs</h1>
          <p>
            {data
              ? `${data.pagination.total.toLocaleString('en-US')} logs match these filters`
              : 'Loading…'}
          </p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={() => load()}>
          ↻ Refresh
        </button>
      </div>

      {data && (
        <div className="admin-metric-grid">
          <div className="admin-metric">
            <div className="admin-metric-icon">📥</div>
            <div className="admin-metric-value">
              {data.summary.totalToday.toLocaleString('en-US')}
            </div>
            <div className="admin-metric-label">Today total</div>
          </div>
          <div className="admin-metric">
            <div className="admin-metric-icon">⚠️</div>
            <div className="admin-metric-value">
              {data.summary.errorsToday.toLocaleString('en-US')}
            </div>
            <div className="admin-metric-label">Errors today</div>
          </div>
          <div className="admin-metric">
            <div className="admin-metric-icon">⏱️</div>
            <div className="admin-metric-value">{data.summary.avgLatencyMs}</div>
            <div className="admin-metric-label">Avg latency (ms)</div>
          </div>
        </div>
      )}

      <form className="admin-filter-bar" onSubmit={applyUserId}>
        <select
          className="admin-select"
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="">All types</option>
          <option value="chat">chat</option>
          <option value="quiz">quiz</option>
          <option value="weakness-quiz">weakness-quiz</option>
          <option value="essay">essay</option>
        </select>

        <select
          className="admin-select"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="ok">ok</option>
          <option value="error">error</option>
          <option value="rate_limited">rate_limited</option>
        </select>

        <input
          className="admin-input"
          placeholder="userId (cuid)"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          style={{ width: 220 }}
        />

        <input
          className="admin-input"
          type="datetime-local"
          value={dateFrom}
          onChange={(e) => {
            setPage(1);
            setDateFrom(e.target.value);
          }}
          style={{ width: 200 }}
        />
        <input
          className="admin-input"
          type="datetime-local"
          value={dateTo}
          onChange={(e) => {
            setPage(1);
            setDateTo(e.target.value);
          }}
          style={{ width: 200 }}
        />

        <button className="admin-btn admin-btn-primary" type="submit">
          Apply
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={resetFilters}>
          Reset
        </button>
      </form>

      {error && (
        <div className="admin-card" style={{ borderColor: '#fca5a5', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--g400)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && data?.logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--g400)' }}>
                    No logs match these filters.
                  </td>
                </tr>
              )}
              {!loading &&
                data?.logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--g600)', fontSize: 12 }}>
                      {fmtTime(l.createdAt)}
                    </td>
                    <td>
                      {l.userId ? (
                        <div>
                          <div style={{ fontSize: 12.5 }}>{l.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--g400)' }}>{l.userEmail}</div>
                        </div>
                      ) : (
                        <span className="admin-badge admin-badge-info">Anonymous</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-info">{l.type}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[l.status] || ''}`}>
                        {STATUS_LABEL[l.status] || l.status}
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {l.latencyMs != null ? `${l.latencyMs} ms` : '—'}
                    </td>
                    <td
                      style={{
                        maxWidth: 280,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: l.errorMsg ? '#b91c1c' : 'var(--g400)',
                        fontSize: 12,
                      }}
                      title={l.errorMsg || ''}
                    >
                      {l.errorMsg || '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginTop: 14,
          }}
        >
          <button
            className="admin-btn admin-btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 12, color: 'var(--g600)' }}>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
            disabled={page >= data.pagination.pages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
