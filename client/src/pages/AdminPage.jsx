import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_TYPES = [
  { value: 'sat_math', label: 'SAT Math' },
  { value: 'sat_rw', label: 'SAT Reading & Writing' },
  { value: 'ielts_reading', label: 'IELTS Reading' },
  { value: 'ielts_writing', label: 'IELTS Writing' },
  { value: 'ielts_listening', label: 'IELTS Listening' },
  { value: 'custom', label: 'Custom' },
];

const Q_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'grid', label: 'Grid-in (Number)' },
  { value: 'essay', label: 'Essay' },
];

function fmtTime(s) {
  if (!s) return '—';
  return `${Math.floor(s / 60)} min`;
}

const EMPTY_TEST = {
  title: '',
  type: 'sat_math',
  description: '',
  timeLimit: '',
  isPublished: false,
};

const EMPTY_QUESTION = {
  orderIndex: 0,
  type: 'mcq',
  section: '',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputStyle = {
  border: '2px solid #e4e4e7',
  borderRadius: 9,
  padding: '8px 12px',
  fontSize: 13,
  fontFamily: "'Outfit',sans-serif",
  outline: 'none',
  transition: 'border-color .2s',
  background: '#fff',
  color: '#1c1917',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 30,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ published }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 9px',
        borderRadius: 999,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        background: published ? '#dcfce7' : '#fef9c3',
        color: published ? '#15803d' : '#854d0e',
        border: `1px solid ${published ? '#86efac' : '#fcd34d'}`,
      }}
    >
      {published ? '✓ Published' : 'Draft'}
    </span>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function Alert({ type = 'error', msg, onClose }) {
  if (!msg) return null;
  const colors = {
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  };
  const c = colors[type] || colors.error;
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <span>{msg}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: c.text,
            fontSize: 16,
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 5,
      }}
    >
      {children}
    </div>
  );
}

// ─── Question Editor ──────────────────────────────────────────────────────────

function QuestionEditor({ q, idx, onChange, onDelete }) {
  function setField(field, val) {
    onChange(idx, { ...q, [field]: val });
  }
  function setOption(i, val) {
    const opts = [...(q.options || ['', '', '', ''])];
    opts[i] = val;
    onChange(idx, { ...q, options: opts });
  }

  return (
    <div
      style={{
        background: '#fafafa',
        border: '1px solid #e4e4e7',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 12,
      }}
    >
      {/* Row 1: type / section / order / remove */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            background: 'var(--p4)',
            color: 'var(--p)',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 9px',
            borderRadius: 999,
          }}
        >
          Q{idx + 1}
        </span>

        <select
          value={q.type}
          onChange={(e) => setField('type', e.target.value)}
          style={selectStyle}
        >
          {Q_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <input
          placeholder="Section (optional)"
          value={q.section || ''}
          onChange={(e) => setField('section', e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 120 }}
        />

        <input
          type="number"
          placeholder="Order"
          value={q.orderIndex}
          onChange={(e) => setField('orderIndex', parseInt(e.target.value) || 0)}
          style={{ ...inputStyle, width: 70 }}
        />

        <button
          onClick={() => onDelete(idx)}
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            borderRadius: 7,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          ✕ Remove
        </button>
      </div>

      {/* Question text */}
      <textarea
        placeholder="Question text *"
        value={q.questionText}
        onChange={(e) => setField('questionText', e.target.value)}
        rows={2}
        style={{ ...inputStyle, width: '100%', resize: 'vertical', marginBottom: 10 }}
      />

      {/* MCQ options */}
      {q.type === 'mcq' && (
        <div style={{ marginBottom: 10 }}>
          <FieldLabel>Answer Options</FieldLabel>
          {(q.options || ['', '', '', '']).map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <span
                style={{
                  width: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#9ca3af',
                  textAlign: 'center',
                }}
              >
                {String.fromCharCode(65 + i)}.
              </span>
              <input
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Correct answer + explanation */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <FieldLabel>Correct Answer *</FieldLabel>
          <input
            placeholder={q.type === 'mcq' ? 'e.g. A or full text' : 'Correct answer'}
            value={q.correctAnswer}
            onChange={(e) => setField('correctAnswer', e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div style={{ flex: 2, minWidth: 200 }}>
          <FieldLabel>Explanation</FieldLabel>
          <input
            placeholder="Explanation for students (optional)"
            value={q.explanation || ''}
            onChange={(e) => setField('explanation', e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Test Form Modal ──────────────────────────────────────────────────────────

function TestModal({ test, onClose, onSave }) {
  const isEdit = !!test?.id;
  const [form, setFormState] = useState(
    isEdit
      ? {
          title: test.title,
          type: test.type,
          description: test.description || '',
          timeLimit: test.timeLimit ? String(Math.round(test.timeLimit / 60)) : '',
          isPublished: test.isPublished,
        }
      : { ...EMPTY_TEST }
  );
  const [questions, setQuestions] = useState(
    isEdit && test.questions
      ? test.questions.map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
        }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function setField(f, v) {
    setFormState((p) => ({ ...p, [f]: v }));
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, { ...EMPTY_QUESTION, orderIndex: qs.length }]);
  }

  function updateQuestion(idx, q) {
    setQuestions((qs) => qs.map((old, i) => (i === idx ? q : old)));
  }

  function removeQuestion(idx) {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setErr('Title is required.');
      return;
    }
    if (!form.type) {
      setErr('Type is required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim() || undefined,
      timeLimit: form.timeLimit ? parseInt(form.timeLimit) * 60 : undefined,
      isPublished: form.isPublished,
      questions: questions.map((q) => ({
        orderIndex: q.orderIndex,
        type: q.type,
        section: q.section || undefined,
        questionText: q.questionText,
        options: q.type === 'mcq' ? q.options.filter(Boolean) : undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || undefined,
      })),
    };

    setLoading(true);
    setErr('');
    try {
      const result = isEdit
        ? await api.patch(`/api/admin/tests/${test.id}`, payload)
        : await api.post('/api/admin/tests', payload);
      onSave(result.test, isEdit);
    } catch (e) {
      setErr(e.message || 'Failed to save test.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px 28px',
          width: '100%',
          maxWidth: 740,
          boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700 }}>
            {isEdit ? 'Edit Test' : 'Create New Test'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#f4f4f5',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <Alert type="error" msg={err} onClose={() => setErr('')} />

        {/* Basic info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>Title *</FieldLabel>
            <input
              placeholder="e.g. SAT Math Practice Exam 3"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div>
            <FieldLabel>Type *</FieldLabel>
            <select
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              style={{ ...selectStyle, width: '100%' }}
            >
              {TEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Time Limit (minutes)</FieldLabel>
            <input
              type="number"
              placeholder="e.g. 60"
              min={1}
              value={form.timeLimit}
              onChange={(e) => setField('timeLimit', e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <FieldLabel>Description</FieldLabel>
            <textarea
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={2}
              style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 600,
            color: '#52525b',
          }}
        >
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setField('isPublished', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--p)', cursor: 'pointer' }}
          />
          Publish immediately (visible to students)
        </label>

        {/* Questions */}
        <div style={{ borderTop: '1px solid #e4e4e7', paddingTop: 20, marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ fontFamily: "'Lora',serif", fontSize: 16, fontWeight: 700 }}>
              Questions ({questions.length})
            </div>
            <button
              onClick={addQuestion}
              style={{
                background: 'var(--p4)',
                color: 'var(--p)',
                border: '1px solid #c4b5fd',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Add Question
            </button>
          </div>

          {questions.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#a1a1aa',
                fontSize: 13,
                background: '#fafafa',
                borderRadius: 10,
                border: '1px dashed #d4d4d8',
              }}
            >
              No questions yet. Click "+ Add Question" to start.
            </div>
          )}

          {questions.map((q, i) => (
            <QuestionEditor
              key={i}
              q={q}
              idx={i}
              onChange={updateQuestion}
              onDelete={removeQuestion}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            paddingTop: 16,
            borderTop: '1px solid #e4e4e7',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: '#fff',
              border: '2px solid #e4e4e7',
              color: '#52525b',
              borderRadius: 999,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg,#6d28d9,#db2777)',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '10px 28px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading && <Spinner size={14} />}
            {isEdit ? 'Save Changes' : 'Create Test'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Test Detail View ─────────────────────────────────────────────────────────

function TestDetail({ test: initialTest, onBack }) {
  // BUG FIX: держим test локально, чтобы publish-статус обновлялся без перезагрузки
  const [test, setTest] = useState(initialTest);
  const [questions, setQuestions] = useState(initialTest.questions || []);
  const [newQ, setNewQ] = useState(null);
  // editingQ хранит { id, data } — вопрос, который сейчас редактируется
  const [editingQ, setEditingQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  }

  // ── Publish toggle ────────────────────────────────────────────────────────
  async function togglePublish() {
    setLoading(true);
    try {
      const { test: updated } = await api.patch(`/api/admin/tests/${test.id}/publish`, {
        isPublished: !test.isPublished,
      });
      // BUG FIX: обновляем локальный test, а не только вызываем onRefresh
      setTest((t) => ({ ...t, isPublished: updated.isPublished }));
      showMsg('success', updated.isPublished ? '🚀 Published!' : 'Moved to Draft.');
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Add new question ──────────────────────────────────────────────────────
  async function saveNewQuestion() {
    if (!newQ?.questionText?.trim()) {
      showMsg('error', 'Question text is required.');
      return;
    }
    if (!newQ.correctAnswer?.trim()) {
      showMsg('error', 'Correct answer is required.');
      return;
    }
    setLoading(true);
    try {
      const { question } = await api.post(`/api/admin/tests/${test.id}/questions`, {
        orderIndex: newQ.orderIndex,
        type: newQ.type,
        section: newQ.section || undefined,
        questionText: newQ.questionText,
        options: newQ.type === 'mcq' ? (newQ.options || []).filter(Boolean) : undefined,
        correctAnswer: newQ.correctAnswer,
        explanation: newQ.explanation || undefined,
      });
      setQuestions((qs) => [...qs, question]);
      setNewQ(null);
      showMsg('success', 'Question added.');
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Save edited question ──────────────────────────────────────────────────
  async function saveEditedQuestion() {
    if (!editingQ?.data?.questionText?.trim()) {
      showMsg('error', 'Question text is required.');
      return;
    }
    if (!editingQ.data.correctAnswer?.trim()) {
      showMsg('error', 'Correct answer is required.');
      return;
    }
    setLoading(true);
    try {
      const { question } = await api.patch(`/api/admin/questions/${editingQ.id}`, {
        orderIndex: editingQ.data.orderIndex,
        type: editingQ.data.type,
        section: editingQ.data.section || undefined,
        questionText: editingQ.data.questionText,
        options:
          editingQ.data.type === 'mcq' ? (editingQ.data.options || []).filter(Boolean) : undefined,
        correctAnswer: editingQ.data.correctAnswer,
        explanation: editingQ.data.explanation || undefined,
      });
      setQuestions((qs) => qs.map((q) => (q.id === question.id ? question : q)));
      setEditingQ(null);
      showMsg('success', 'Question updated.');
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Delete question ───────────────────────────────────────────────────────
  async function deleteQ(qId) {
    if (!window.confirm('Delete this question?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/questions/${qId}`);
      setQuestions((qs) => qs.filter((q) => q.id !== qId));
      showMsg('success', 'Question deleted.');
    } catch (e) {
      showMsg('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← Back to Tests
      </button>

      {/* Test header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div>
          <h2
            style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}
          >
            {test.title}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge published={test.isPublished} />
            <span style={{ fontSize: 12, color: '#a1a1aa' }}>
              {TEST_TYPES.find((t) => t.value === test.type)?.label || test.type}
            </span>
            {test.timeLimit && (
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>⏱ {fmtTime(test.timeLimit)}</span>
            )}
            <span style={{ fontSize: 12, color: '#a1a1aa' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button
          onClick={togglePublish}
          disabled={loading}
          style={{
            background: test.isPublished ? '#fef9c3' : 'linear-gradient(135deg,#6d28d9,#db2777)',
            color: test.isPublished ? '#854d0e' : '#fff',
            border: test.isPublished ? '1px solid #fcd34d' : 'none',
            borderRadius: 999,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {test.isPublished ? 'Unpublish' : '🚀 Publish'}
        </button>
      </div>

      {test.description && (
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 16, lineHeight: 1.6 }}>
          {test.description}
        </p>
      )}

      <Alert
        type={msg.type || 'error'}
        msg={msg.text}
        onClose={() => setMsg({ type: '', text: '' })}
      />

      {/* Questions list */}
      <div
        style={{
          fontFamily: "'Lora',serif",
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 14,
          marginTop: 8,
        }}
      >
        Questions
      </div>

      {questions.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            color: '#a1a1aa',
            fontSize: 13,
            background: '#fafafa',
            borderRadius: 10,
            border: '1px dashed #d4d4d8',
            marginBottom: 16,
          }}
        >
          No questions yet. Add the first one below!
        </div>
      )}

      {questions.map((q, i) => {
        // If this question is being edited, show the editor inline
        if (editingQ?.id === q.id) {
          return (
            <div
              key={q.id}
              style={{
                background: '#f5f3ff',
                border: '1px solid #c4b5fd',
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--p)',
                }}
              >
                Editing Q{i + 1}
              </div>
              <QuestionEditor
                q={editingQ.data}
                idx={i}
                onChange={(_, updated) => setEditingQ((e) => ({ ...e, data: updated }))}
                onDelete={() => setEditingQ(null)}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingQ(null)}
                  style={{
                    background: '#fff',
                    border: '2px solid #e4e4e7',
                    borderRadius: 999,
                    padding: '7px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedQuestion}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg,#6d28d9,#db2777)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '7px 18px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading && <Spinner size={12} />}
                  Save Question
                </button>
              </div>
            </div>
          );
        }

        // Normal read view
        return (
          <div
            key={q.id}
            style={{
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'var(--p4)',
                      color: 'var(--p)',
                      padding: '1px 7px',
                      borderRadius: 999,
                    }}
                  >
                    Q{i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: '#f4f4f5',
                      color: '#52525b',
                      padding: '1px 7px',
                      borderRadius: 999,
                    }}
                  >
                    {Q_TYPES.find((t) => t.value === q.type)?.label || q.type}
                  </span>
                  {q.section && (
                    <span
                      style={{
                        fontSize: 11,
                        background: '#f4f4f5',
                        color: '#52525b',
                        padding: '1px 7px',
                        borderRadius: 999,
                      }}
                    >
                      {q.section}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    marginBottom: 6,
                    color: '#1c1917',
                  }}
                >
                  {q.questionText.length > 160
                    ? q.questionText.slice(0, 160) + '…'
                    : q.questionText}
                </div>
                <div style={{ fontSize: 11.5, color: '#059669' }}>✓ {q.correctAnswer}</div>
                {q.explanation && (
                  <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 3 }}>
                    💡{' '}
                    {q.explanation.length > 100 ? q.explanation.slice(0, 100) + '…' : q.explanation}
                  </div>
                )}
              </div>

              {/* BUG FIX: добавлена кнопка Edit вопроса */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() =>
                    setEditingQ({
                      id: q.id,
                      data: {
                        ...q,
                        options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                      },
                    })
                  }
                  style={{
                    background: 'var(--p4)',
                    border: '1px solid #c4b5fd',
                    color: 'var(--p)',
                    borderRadius: 7,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteQ(q.id)}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    borderRadius: 7,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add question inline */}
      {newQ ? (
        <div
          style={{
            background: '#f5f3ff',
            border: '1px solid #c4b5fd',
            borderRadius: 12,
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{ fontFamily: "'Lora',serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}
          >
            New Question
          </div>
          <QuestionEditor
            q={newQ}
            idx={questions.length}
            onChange={(_, q) => setNewQ(q)}
            onDelete={() => setNewQ(null)}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setNewQ(null)}
              style={{
                background: '#fff',
                border: '2px solid #e4e4e7',
                borderRadius: 999,
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveNewQuestion}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg,#6d28d9,#db2777)',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading && <Spinner size={12} />} Save Question
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setNewQ({ ...EMPTY_QUESTION, orderIndex: questions.length })}
          style={{
            background: '#f5f3ff',
            border: '1px dashed #c4b5fd',
            color: 'var(--p)',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            marginBottom: 16,
          }}
        >
          + Add Question
        </button>
      )}
    </div>
  );
}

// ─── Tests List ───────────────────────────────────────────────────────────────

function TestsList({ onSelect, refreshKey }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // BUG FIX: сохраняем isEdit в ref чтобы избежать stale closure в handleSaved
  const isEditRef = useRef(false);

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const { tests } = await api.get('/api/admin/tests');
      setTests(tests);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function deleteTest(id, title) {
    if (!window.confirm(`Delete "${title}"? This will also delete all questions.`)) return;
    try {
      await api.delete(`/api/admin/tests/${id}`);
      setTests((ts) => ts.filter((t) => t.id !== id));
      showMsg('success', 'Test deleted.');
    } catch (e) {
      showMsg('error', e.message);
    }
  }

  async function togglePublish(test) {
    try {
      const { test: updated } = await api.patch(`/api/admin/tests/${test.id}/publish`, {
        isPublished: !test.isPublished,
      });
      setTests((ts) =>
        ts.map((t) => (t.id === updated.id ? { ...t, isPublished: updated.isPublished } : t))
      );
    } catch (e) {
      showMsg('error', e.message);
    }
  }

  // BUG FIX: используем ref для isEdit, чтобы closure не захватила старый editing
  function handleSaved(test, wasEdit) {
    setTests((ts) => {
      if (wasEdit) return ts.map((t) => (t.id === test.id ? { ...t, ...test } : t));
      return [test, ...ts];
    });
    setShowModal(false);
    setEditing(null);
    showMsg('success', wasEdit ? 'Test updated!' : 'Test created!');
  }

  // Filtered list
  const visible = tests.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && t.type !== filterType) return false;
    if (filterStatus === 'published' && !t.isPublished) return false;
    if (filterStatus === 'draft' && t.isPublished) return false;
    return true;
  });

  // Stats
  const publishedCount = tests.filter((t) => t.isPublished).length;
  const draftCount = tests.length - publishedCount;

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div className="lds">
          <div className="ld" />
          <div className="ld" />
          <div className="ld" />
        </div>
      </div>
    );

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: tests.length, color: '#6d28d9', bg: '#f5f3ff' },
          { label: 'Published', value: publishedCount, color: '#15803d', bg: '#f0fdf4' },
          { label: 'Drafts', value: draftCount, color: '#854d0e', bg: '#fefce8' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1px solid ${s.color}22`,
              borderRadius: 10,
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Lora',serif", color: s.color }}
            >
              {s.value}
            </span>
            <span
              style={{
                fontSize: 11,
                color: s.color,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Header + New Test button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700 }}>All Tests</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          style={{
            background: 'linear-gradient(135deg,#6d28d9,#db2777)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(109,40,217,.28)',
          }}
        >
          + New Test
        </button>
      </div>

      {/* Search & filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ ...selectStyle, minWidth: 160 }}
        >
          <option value="">All Types</option>
          {TEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...selectStyle, minWidth: 130 }}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || filterType || filterStatus) && (
          <button
            onClick={() => {
              setSearch('');
              setFilterType('');
              setFilterStatus('');
            }}
            style={{
              background: '#f4f4f5',
              border: '1px solid #d4d4d8',
              borderRadius: 9,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#52525b',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {err && <Alert type="error" msg={err} />}
      <Alert
        type={msg.type || 'error'}
        msg={msg.text}
        onClose={() => setMsg({ type: '', text: '' })}
      />

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a1a1aa' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {tests.length === 0 ? 'No tests yet' : 'No tests match your filters'}
          </div>
          <div style={{ fontSize: 13 }}>
            {tests.length === 0
              ? 'Click "+ New Test" to create your first test.'
              : 'Try clearing the search or filters.'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((test) => (
          <div
            key={test.id}
            style={{
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 14,
              padding: '18px 20px',
              transition: 'border-color .15s, box-shadow .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c4b5fd';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,40,217,.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e4e4e7';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: 5,
                  }}
                >
                  <Badge published={test.isPublished} />
                  <span
                    style={{
                      fontSize: 11,
                      background: '#f4f4f5',
                      color: '#52525b',
                      padding: '1px 8px',
                      borderRadius: 999,
                      fontWeight: 600,
                    }}
                  >
                    {TEST_TYPES.find((t) => t.value === test.type)?.label || test.type}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1c1917' }}>
                  {test.title}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {test.timeLimit && (
                    <span style={{ fontSize: 11.5, color: '#6b7280' }}>
                      ⏱ {fmtTime(test.timeLimit)}
                    </span>
                  )}
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>
                    {test._count?.questions ?? '?'} question
                    {(test._count?.questions ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#6b7280' }}>
                    by {test.creator?.name || 'Admin'}
                  </span>
                </div>
                {test.description && (
                  <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 5, lineHeight: 1.5 }}>
                    {test.description.length > 100
                      ? test.description.slice(0, 100) + '…'
                      : test.description}
                  </p>
                )}
              </div>

              {/* Right: actions */}
              <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap' }}>
                <button
                  onClick={() => togglePublish(test)}
                  style={{
                    background: test.isPublished ? '#fef9c3' : '#f0fdf4',
                    border: `1px solid ${test.isPublished ? '#fcd34d' : '#86efac'}`,
                    color: test.isPublished ? '#854d0e' : '#15803d',
                    borderRadius: 7,
                    padding: '5px 11px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {test.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => {
                    setEditing(test);
                    setShowModal(true);
                  }}
                  style={{
                    background: 'var(--p4)',
                    border: '1px solid #c4b5fd',
                    color: 'var(--p)',
                    borderRadius: 7,
                    padding: '5px 11px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onSelect(test)}
                  style={{
                    background: '#f4f4f5',
                    border: '1px solid #d4d4d8',
                    color: '#52525b',
                    borderRadius: 7,
                    padding: '5px 11px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Questions
                </button>
                <button
                  onClick={() => deleteTest(test.id, test.title)}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    borderRadius: 7,
                    padding: '5px 11px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TestModal
          test={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage({ user, setPage }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Guard: only ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 700 }}>
          Access Denied
        </div>
        <p style={{ fontSize: 13, color: '#a1a1aa' }}>This page requires Admin privileges.</p>
        <button className="btn btn-p" onClick={() => setPage('home')}>
          ← Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28, maxWidth: 900 }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#c026d3)',
            borderRadius: 18,
            padding: '24px 28px',
            marginBottom: 28,
            color: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  opacity: 0.75,
                  marginBottom: 4,
                }}
              >
                Admin Panel
              </div>
              <h1
                style={{
                  fontFamily: "'Lora',serif",
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Test Management
              </h1>
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                Create and manage SAT/IELTS tests and questions
              </p>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,.15)',
                borderRadius: 12,
                padding: '12px 18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Signed in as</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  background: 'rgba(255,255,255,.2)',
                  borderRadius: 999,
                  padding: '2px 8px',
                  marginTop: 4,
                  display: 'inline-block',
                }}
              >
                ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedTest ? (
          <TestDetail
            test={selectedTest}
            onBack={() => {
              setSelectedTest(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        ) : (
          <TestsList
            onSelect={async (test) => {
              try {
                const { test: full } = await api.get(`/api/admin/tests/${test.id}`);
                setSelectedTest(full);
              } catch {
                setSelectedTest(test);
              }
            }}
            refreshKey={refreshKey}
          />
        )}
      </div>
    </div>
  );
}
