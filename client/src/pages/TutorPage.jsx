import { useState, useEffect, useRef } from 'react';
import { callAI, AIError } from '../utils/ai.js';

const CHIPS = [
  "Explain Newton's Laws",
  'Solve: 2x+5=13',
  'DNA replication?',
  'IELTS essay tips',
  'SAT quadratics',
  'What caused WWI?',
];

export default function TutorPage() {
  const [msgs, setMsgs] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your AI tutor 💜 I cover Physics, Math, Biology, Chemistry, History, Geography, English, Informatics — plus SAT & IELTS prep. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { message, code }
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  async function send(text) {
    const q = text || input.trim();
    if (!q) return;

    setInput('');
    setError(null);
    setMsgs((m) => [...m, { role: 'usr', text: q }]);
    setLoading(true);

    try {
      const history = msgs.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const reply = await callAI(
        "You are a warm expert AI tutor for 'Her Access' — free education for girls. Teach all subjects and SAT/IELTS prep. Explain step-by-step, use examples, be encouraging, keep responses concise for mobile.",
        [...history, { role: 'user', content: q }]
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n\n'),
        1000
      );

      setMsgs((m) => [...m, { role: 'ai', text: reply }]);
    } catch (err) {
      // Детальная обработка ошибок
      if (err instanceof AIError) {
        setError({ message: err.message, code: err.code });

        // Для rate limit — показываем в чате, для остальных — в UI-баннере
        if (err.code === 'RATE_LIMIT') {
          setMsgs((m) => [
            ...m,
            {
              role: 'ai',
              text: '⏳ ' + err.message,
            },
          ]);
        }
      } else {
        // Неожиданная ошибка
        setError({
          message: 'Unexpected error. Please try again.',
          code: 'UNKNOWN',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor-wrap">
      <div style={{ padding: '14px 0 8px' }}>
        <div className="ph" style={{ fontSize: 20 }}>
          🤖 AI Tutor
        </div>
        <div className="ps" style={{ marginBottom: 8 }}>
          Step-by-step answers, any subject.
        </div>
      </div>

      {/* Баннер ошибки (для серьёзных проблем — auth, server) */}
      {error && error.code !== 'RATE_LIMIT' && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 12,
            fontSize: 13,
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {error.code === 'AUTH_ERROR' && 'Service Error'}
              {error.code === 'SERVER_ERROR' && 'Service Unavailable'}
              {error.code === 'NETWORK_ERROR' && 'Connection Issue'}
              {error.code === 'UNKNOWN' && 'Error'}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>{error.message}</div>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
              fontSize: 16,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="chips">
        {CHIPS.map((c) => (
          <span key={c} className="chip" onClick={() => send(c)}>
            {c}
          </span>
        ))}
      </div>

      <div className="chat-area">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'ai' && <div className="mname">Her Access AI</div>}
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="mname">Her Access AI</div>
            <div className="typing">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="cinrow">
        <textarea
          className="cin"
          placeholder="Ask anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        <button className="csend" onClick={() => send()} disabled={loading || !input.trim()}>
          ↑
        </button>
      </div>
    </div>
  );
}
