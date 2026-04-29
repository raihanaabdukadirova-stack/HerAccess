import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

function ActionMenu({ user, onAction, onClose }) {
  return (
    <div className="admin-action-menu" onMouseLeave={onClose}>
      <button onClick={() => onAction('view')}>👤 View Profile</button>
      <button onClick={() => onAction('role')}>✏️ Edit Role</button>
      {user.banned ? (
        <button onClick={() => onAction('unban')}>✅ Unban User</button>
      ) : (
        <button onClick={() => onAction('ban')} className="danger">🚫 Ban User</button>
      )}
      <button onClick={() => onAction('reset')} className="danger">♻️ Reset Progress</button>
      <button onClick={() => onAction('delete')} className="danger">🗑️ Delete Account</button>
    </div>
  );
}

function RoleModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const { user: updated } = await adminApi.updateUserRole(user.id, role);
      onSaved(updated);
    } catch (e) {
      setErr(e.message || 'Failed to update role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Change role</h3>
        <p>
          For <b>{user.name}</b> ({user.email})
        </p>
        <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="STUDENT">STUDENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>{err}</div>}
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BanModal({ user, onClose, onSaved }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function ban() {
    setBusy(true);
    setErr(null);
    try {
      const { user: updated } = await adminApi.banUser(user.id, reason || undefined);
      onSaved(updated);
    } catch (e) {
      setErr(e.message || 'Failed to ban user.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Ban {user.name}?</h3>
        <p>This will immediately log them out and block future logins.</p>
        <label className="admin-field-label">Reason (optional)</label>
        <input
          className="admin-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Visible to the user on login"
          maxLength={500}
        />
        {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>{err}</div>}
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-danger" onClick={ban} disabled={busy}>
            {busy ? 'Banning…' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, text, confirmLabel, danger, onClose, onConfirm }) {
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      await onConfirm();
    } catch (e) {
      setErr(e.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{text}</p>
        {err && <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>{err}</div>}
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={go}
            disabled={busy}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers({ currentUserId, onOpenDetail }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [modal, setModal] = useState(null); // { kind, user }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({ page, limit: 20, search, role, sort, order });
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, role, sort, order]);

  function applySearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function patchUser(updated) {
    setData((prev) =>
      prev
        ? { ...prev, users: prev.users.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) }
        : prev
    );
  }

  function removeUserFromList(id) {
    setData((prev) =>
      prev ? { ...prev, users: prev.users.filter((u) => u.id !== id) } : prev
    );
  }

  function openAction(user, kind) {
    setOpenMenuId(null);
    if (kind === 'view') {
      onOpenDetail(user.id);
      return;
    }
    setModal({ kind, user });
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Users</h1>
          <p>{data ? `${data.pagination.total.toLocaleString('en-US')} users` : 'Loading…'}</p>
        </div>
      </div>

      <form className="admin-filter-bar" onSubmit={applySearch}>
        <input
          className="admin-input grow"
          placeholder="🔍 Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="admin-select"
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All roles</option>
          <option value="STUDENT">STUDENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          className="admin-select"
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(':');
            setPage(1);
            setSort(s);
            setOrder(o);
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="name:asc">Name A→Z</option>
          <option value="name:desc">Name Z→A</option>
          <option value="email:asc">Email A→Z</option>
        </select>
        <button className="admin-btn admin-btn-primary" type="submit">
          Search
        </button>
      </form>

      {error && (
        <div className="admin-card" style={{ borderColor: '#fca5a5', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'visible' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Lessons</th>
                <th>Tests</th>
                <th>Joined</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--g400)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && data?.users.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--g400)' }}>
                    No users match these filters.
                  </td>
                </tr>
              )}
              {!loading &&
                data?.users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--g600)' }}>{u.email}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          u.role === 'ADMIN' ? 'admin-badge-info' : 'admin-badge-ok'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.banned ? (
                        <span className="admin-badge admin-badge-err" title={u.banReason || ''}>
                          BANNED
                        </span>
                      ) : (
                        <span className="admin-badge admin-badge-ok">ACTIVE</span>
                      )}
                    </td>
                    <td>{u.stats.lessonsCompleted}</td>
                    <td>{u.stats.testsTaken}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '4px 10px' }}
                        onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      >
                        ···
                      </button>
                      {openMenuId === u.id && (
                        <ActionMenu
                          user={u}
                          onClose={() => setOpenMenuId(null)}
                          onAction={(kind) => openAction(u, kind)}
                        />
                      )}
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

      {modal?.kind === 'role' && (
        <RoleModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={(u) => {
            patchUser(u);
            setModal(null);
          }}
        />
      )}

      {modal?.kind === 'ban' && (
        <BanModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={(u) => {
            patchUser(u);
            setModal(null);
          }}
        />
      )}

      {modal?.kind === 'unban' && (
        <ConfirmModal
          title={`Unban ${modal.user.name}?`}
          text="They will be able to log in again."
          confirmLabel="Unban"
          onClose={() => setModal(null)}
          onConfirm={async () => {
            const { user } = await adminApi.unbanUser(modal.user.id);
            patchUser(user);
            setModal(null);
          }}
        />
      )}

      {modal?.kind === 'reset' && (
        <ConfirmModal
          title={`Reset progress for ${modal.user.name}?`}
          text="All lessons, mistakes and test scores will be erased. This cannot be undone."
          confirmLabel="Reset Progress"
          danger
          onClose={() => setModal(null)}
          onConfirm={async () => {
            await adminApi.resetUserProgress(modal.user.id);
            await load();
            setModal(null);
          }}
        />
      )}

      {modal?.kind === 'delete' && (
        <ConfirmModal
          title={`Delete ${modal.user.name}?`}
          text={`This permanently removes the account and all associated data. ${
            modal.user.id === currentUserId ? '⚠️ You cannot delete your own account.' : ''
          }`}
          confirmLabel="Delete Account"
          danger
          onClose={() => setModal(null)}
          onConfirm={async () => {
            await adminApi.deleteUser(modal.user.id);
            removeUserFromList(modal.user.id);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
