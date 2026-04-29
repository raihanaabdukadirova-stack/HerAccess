import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi.js';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: 'none',
        background: checked ? 'linear-gradient(135deg,#6d28d9,#db2777)' : 'var(--g200)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .15s',
        padding: 0,
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .15s',
          boxShadow: '0 1px 3px rgba(0,0,0,.18)',
        }}
      />
    </button>
  );
}

function Row({ label, hint, children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) auto',
        gap: 16,
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--g200)',
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--g800)' }}>{label}</div>
        {hint && (
          <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 3 }}>{hint}</div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="admin-card" style={{ marginBottom: 14 }}>
      <div className="admin-card-title">{title}</div>
      <div>{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { settings, geminiModelOptions } = await adminApi.getSettings();
      setForm(settings);
      setOriginal(settings);
      setModels(geminiModelOptions || []);
    } catch (e) {
      setError(e.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setSuccess(false);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function changedKeys() {
    if (!form || !original) return [];
    return Object.keys(form).filter(
      (k) => JSON.stringify(form[k]) !== JSON.stringify(original[k])
    );
  }

  async function save() {
    const keys = changedKeys();
    if (keys.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const patch = {};
      for (const k of keys) patch[k] = form[k];
      const { settings } = await adminApi.updateSettings(patch);
      setForm(settings);
      setOriginal(settings);
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="admin-page-head">
          <div>
            <h1>Settings</h1>
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div>
        <div className="admin-page-head">
          <div>
            <h1>Settings</h1>
            <p style={{ color: '#b91c1c' }}>{error || 'Failed to load settings.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const dirty = changedKeys().length > 0;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>System Settings</h1>
          <p>Platform-wide toggles, rate limits and AI configuration.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {success && (
            <span className="admin-badge admin-badge-ok">Saved</span>
          )}
          <button
            className="admin-btn admin-btn-primary"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : dirty ? 'Save Settings' : 'No changes'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="admin-card"
          style={{ borderColor: '#fca5a5', color: '#b91c1c', marginBottom: 14 }}
        >
          {error}
        </div>
      )}

      <Section title="Registration">
        <Row label="Allow new registrations" hint="When off, sign-up endpoint is disabled.">
          <Toggle
            checked={form.registrationEnabled}
            onChange={(v) => set('registrationEnabled', v)}
          />
        </Row>
      </Section>

      <Section title="Maintenance Mode">
        <Row
          label="Enable maintenance mode"
          hint="All non-admin API requests will return 503. ADMINs bypass."
        >
          <Toggle
            checked={form.maintenanceMode}
            onChange={(v) => set('maintenanceMode', v)}
          />
        </Row>
        <Row label="Message shown to users" hint="Up to 500 characters.">
          <input
            className="admin-input"
            style={{ minWidth: 280 }}
            value={form.maintenanceMessage}
            onChange={(e) => set('maintenanceMessage', e.target.value)}
            maxLength={500}
          />
        </Row>
      </Section>

      <Section title="AI Rate Limits">
        <Row label="Anonymous users (req/min)" hint="0 disables anon access entirely.">
          <input
            className="admin-input"
            type="number"
            min={0}
            max={1000}
            style={{ width: 120 }}
            value={form.anonChatLimit}
            onChange={(e) => set('anonChatLimit', parseInt(e.target.value || '0', 10))}
          />
        </Row>
        <Row label="Authenticated users (req/min)" hint="0 disables AI for everyone.">
          <input
            className="admin-input"
            type="number"
            min={0}
            max={10000}
            style={{ width: 120 }}
            value={form.authChatLimit}
            onChange={(e) => set('authChatLimit', parseInt(e.target.value || '0', 10))}
          />
        </Row>
      </Section>

      <Section title="AI Model">
        <Row label="Gemini model" hint="Default model for chat, quizzes and essay checks.">
          <select
            className="admin-select"
            style={{ minWidth: 220 }}
            value={form.geminiModel}
            onChange={(e) => set('geminiModel', e.target.value)}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Max quiz questions" hint="Upper bound for AI quiz generation.">
          <input
            className="admin-input"
            type="number"
            min={1}
            max={50}
            style={{ width: 120 }}
            value={form.maxQuizQuestions}
            onChange={(e) => set('maxQuizQuestions', parseInt(e.target.value || '1', 10))}
          />
        </Row>
      </Section>

      <Section title="Featured Content">
        <Row label="Featured SAT Exam ID" hint="Highlighted on the SAT page. Leave empty for none.">
          <input
            className="admin-input"
            style={{ minWidth: 280 }}
            value={form.featuredExamId ?? ''}
            onChange={(e) => set('featuredExamId', e.target.value || null)}
          />
        </Row>
      </Section>
    </div>
  );
}
