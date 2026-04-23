import { useState, useRef } from 'react';
import { IELTS_PASSAGE, IELTS_WRITING_PROMPT } from '../data/ielts.js';
import { api } from '../utils/api.js';
import { audioUrl, LISTENING_SECTIONS } from '../utils/media.js';
import { recordMistake, recordTestScore } from '../utils/store.js';
import { callAI } from '../utils/ai.js';

// ─── Listening ────────────────────────────────────────────────────────────────

function ListeningSection({ section, onBack }) {
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);

  const src = audioUrl(section.file);
  const score = done ? section.questions.filter((q) => answers[q.id] === q.answer).length : 0;

  function submit() {
    section.questions.forEach((q) => {
      if (answers[q.id] !== q.answer) {
        recordMistake('IELTS', 'Listening', q.text, q.answer, answers[q.id] || 'unanswered');
      }
    });
    recordTestScore('ielts_listening', score, section.questions.length, 'Listening');
    setDone(true);
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={onBack}>
          ← Back to Listening
        </button>
        <div className="ph">🎧 {section.title}</div>

        {/* ── Аудиоплеер ── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1a003a,#2d0058)',
            borderRadius: 'var(--r)',
            padding: '20px 24px',
            marginBottom: 22,
            maxWidth: 560,
          }}
        >
          {audioError ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', padding: '12px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎵</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                Audio coming soon
              </div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>
                Place MP3 files in{' '}
                <code
                  style={{
                    background: 'rgba(255,255,255,.1)',
                    padding: '1px 5px',
                    borderRadius: 3,
                  }}
                >
                  client/public/media/audio/
                </code>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🎧
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    {section.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginTop: 2 }}>
                    {audioReady ? 'Ready to play' : 'Loading…'}
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                controls
                preload="metadata"
                style={{ width: '100%', borderRadius: 8 }}
                onCanPlay={() => setAudioReady(true)}
                onError={() => setAudioError(true)}
              >
                <source src={src} type="audio/mpeg" />
                <source src={src.replace('.mp3', '.ogg')} type="audio/ogg" />
              </audio>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: 'rgba(255,255,255,.5)',
                  lineHeight: 1.6,
                }}
              >
                💡 Listen once through, then answer the questions below. You can replay any part.
              </div>
            </>
          )}
        </div>

        {/* ── Вопросы ── */}
        {!done ? (
          <>
            <div className="shed">Questions</div>
            {section.questions.map((q, i) => (
              <div key={q.id} className="qcard" style={{ marginBottom: 12 }}>
                <div className="qtxt">
                  {i + 1}. {q.text}
                </div>
                <div className="qopts">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`qopt ${answers[q.id] === opt ? 'sel' : ''}`}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    >
                      <span style={{ fontWeight: 700, marginRight: 8, color: 'var(--g400)' }}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="btn btn-p"
              disabled={Object.keys(answers).length < section.questions.length}
              onClick={submit}
            >
              Submit Answers →
            </button>
            {Object.keys(answers).length < section.questions.length && (
              <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 8 }}>
                Answer all {section.questions.length} questions to submit.
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>
              {score === section.questions.length
                ? '🎉'
                : score >= section.questions.length / 2
                  ? '💪'
                  : '📖'}
            </div>
            <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>
              Listening Complete!
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg,#6d28d9,#db2777)',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 16,
                margin: '10px 0 18px',
              }}
            >
              {score} / {section.questions.length}
            </div>
            {section.questions.map((q, i) => {
              const correct = answers[q.id] === q.answer;
              return (
                <div
                  key={q.id}
                  style={{
                    background: correct ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${correct ? '#86efac' : '#fca5a5'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    textAlign: 'left',
                    marginBottom: 8,
                    maxWidth: 520,
                    margin: '8px auto',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                    {i + 1}. {q.text}
                  </div>
                  <div style={{ fontSize: 11.5, color: correct ? '#059669' : '#dc2626' }}>
                    {correct
                      ? '✓ Correct'
                      : `✗ You: ${answers[q.id] || 'unanswered'} → Correct: ${q.answer}`}
                  </div>
                  {!correct && (
                    <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 3 }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button
                className="btn btn-o"
                onClick={() => {
                  setDone(false);
                  setAnswers({});
                }}
              >
                Retry
              </button>
              <button className="btn btn-p" onClick={onBack}>
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Speaking ─────────────────────────────────────────────────────────────────

const SPEAKING_PARTS = [
  {
    id: 'p1',
    label: 'Part 1 — Introduction',
    prompt:
      'Tell me about yourself and where you are from. What do you like to do in your free time?',
    tips: ['Speak for 1–2 minutes', 'Use a variety of tenses', 'Give reasons and examples'],
  },
  {
    id: 'p2',
    label: 'Part 2 — Long Turn',
    prompt: `Describe a time when you helped someone.\n\nYou should say:\n• Who you helped\n• What you did\n• Why you helped them\n\nSpeak for 1–2 minutes.`,
    tips: [
      'Use the 1-minute prep time wisely',
      'Cover all bullet points',
      'Speak until told to stop',
    ],
  },
  {
    id: 'p3',
    label: 'Part 3 — Discussion',
    prompt:
      'Do you think people today are more or less willing to help strangers than they were in the past? Why?',
    tips: ['Give your opinion clearly', 'Support with reasons', 'Discuss both sides if relevant'],
  },
];

function SpeakingTrainer({ onBack }) {
  const [partIdx, setPartIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const part = SPEAKING_PARTS[partIdx];

  async function getFeedback() {
    if (response.trim().split(/\s+/).length < 20) return;
    setLoading(true);
    setFeedback(null);
    try {
      const text = await callAI(
        `You are an expert IELTS Speaking examiner. Evaluate the candidate's response for IELTS Speaking ${part.label}.
Respond ONLY with a JSON object: {"band": 6.5, "fluency": 7, "vocabulary": 6, "grammar": 6, "pronunciation_note": "one sentence tip", "feedback": "2-3 sentences overall", "improvements": ["tip1", "tip2"]}`,
        `IELTS Speaking Prompt: ${part.prompt}\n\nCandidate response: ${response}`,
        600
      );
      const clean = text.replace(/```json|```/g, '').trim();
      setFeedback(JSON.parse(clean));
    } catch {
      setFeedback({
        band: '—',
        feedback: 'Could not evaluate. Please try again.',
        improvements: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={onBack}>
          ← Back to Speaking
        </button>
        <div className="ph">🎤 IELTS Speaking Trainer</div>
        <div className="ps">Type your spoken response — AI gives instant band score feedback.</div>

        {/* ── Выбор части ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {SPEAKING_PARTS.map((p, i) => (
            <button
              key={p.id}
              className={`sat-tab ${partIdx === i ? 'act' : ''}`}
              onClick={() => {
                setPartIdx(i);
                setResponse('');
                setFeedback(null);
              }}
            >
              {p.label.split(' — ')[0]}
            </button>
          ))}
        </div>

        {/* ── Карточка с заданием ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'var(--p)',
              marginBottom: 10,
            }}
          >
            {part.label}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 14 }}>
            {part.prompt}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {part.tips.map((tip) => (
              <span
                key={tip}
                style={{
                  fontSize: 11,
                  background: 'var(--p4)',
                  color: 'var(--p)',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontWeight: 500,
                }}
              >
                {tip}
              </span>
            ))}
          </div>
        </div>

        {/* ── Поле ответа ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g600)' }}>
            Your response
          </label>
          <span style={{ fontSize: 12, color: 'var(--g400)' }}>
            {response.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <textarea
          className="essay-area"
          placeholder="Type what you would say out loud…"
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setFeedback(null);
          }}
          style={{ minHeight: 140 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
          {partIdx < SPEAKING_PARTS.length - 1 && (
            <button
              className="btn btn-o"
              onClick={() => {
                setPartIdx((i) => i + 1);
                setResponse('');
                setFeedback(null);
              }}
            >
              Next Part →
            </button>
          )}
          <button
            className="btn btn-p"
            onClick={getFeedback}
            disabled={loading || response.trim().split(/\s+/).length < 20}
          >
            {loading ? 'Evaluating…' : 'Get AI Feedback →'}
          </button>
        </div>
        {response.trim().split(/\s+/).filter(Boolean).length < 20 && response.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 6, textAlign: 'right' }}>
            Write at least 20 words to get feedback.
          </div>
        )}

        {/* ── Результаты ── */}
        {feedback && (
          <div style={{ marginTop: 22 }}>
            <div className="band-badge">Band Score: {feedback.band}</div>
            {feedback.fluency !== undefined && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                {[
                  ['Fluency', feedback.fluency],
                  ['Vocabulary', feedback.vocabulary],
                  ['Grammar', feedback.grammar],
                ].map(([k, v]) => (
                  <div key={k} className="sscore">
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--p)' }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--g400)', lineHeight: 1.3 }}>{k}</div>
                  </div>
                ))}
              </div>
            )}
            {feedback.pronunciation_note && (
              <div
                style={{
                  background: 'var(--g50)',
                  border: '1px solid var(--g200)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  color: 'var(--g600)',
                  marginBottom: 12,
                }}
              >
                🗣️ Pronunciation tip: {feedback.pronunciation_note}
              </div>
            )}
            <div
              style={{
                background: 'var(--p4)',
                borderLeft: '3px solid var(--p2)',
                padding: '12px 14px',
                borderRadius: '0 8px 8px 0',
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 12,
              }}
            >
              {feedback.feedback}
            </div>
            {feedback.improvements?.length > 0 && (
              <div>
                {feedback.improvements.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 13,
                      marginBottom: 7,
                      color: 'var(--g600)',
                    }}
                  >
                    <span style={{ color: 'var(--p)', fontWeight: 700 }}>{i + 1}.</span>
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Главная страница IELTS ───────────────────────────────────────────────────

export default function IELTSPage({ setPage }) {
  const [section, setSection] = useState('menu');
  const [listeningSection, setListeningSection] = useState(null);

  // Reading state
  const [rAnswers, setRAnswers] = useState({});
  const [rDone, setRDone] = useState(false);

  // Writing state
  const [essay, setEssay] = useState('');
  const [checking, setChecking] = useState(false);
  const [essayResult, setEssayResult] = useState(null);

  async function checkEssay() {
    if (essay.trim().split(/\s+/).length < 50) return;
    setChecking(true);
    setEssayResult(null);
    try {
      const result = await api.post('/api/ai/essay', { essay });
      setEssayResult(result);
      recordTestScore('ielts_writing', 0, 9, 'Writing');
    } catch {
      setEssayResult({ band: '—', feedback: 'Unable to evaluate. Try again.', improvements: [] });
    } finally {
      setChecking(false);
    }
  }

  const rScore = rDone
    ? IELTS_PASSAGE.questions.filter((q) => rAnswers[q.id] === q.answer).length
    : 0;

  // ── Speaking ──
  if (section === 'speaking') return <SpeakingTrainer onBack={() => setSection('menu')} />;

  // ── Listening: выбор секции ──
  if (section === 'listening' && !listeningSection)
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => setSection('menu')}>
            ← Back to IELTS
          </button>
          <div className="ph">🎧 IELTS Listening</div>
          <div className="ps">Choose a section to practise.</div>
          <div className="g2">
            {LISTENING_SECTIONS.map((s) => (
              <div key={s.id} className="ielts-sec" onClick={() => setListeningSection(s)}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>🎧</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--g400)' }}>
                  {s.questions.length} questions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  // ── Listening: конкретная секция ──
  if (section === 'listening' && listeningSection)
    return <ListeningSection section={listeningSection} onBack={() => setListeningSection(null)} />;

  // ── Reading ──
  if (section === 'reading')
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button
            className="back-btn"
            onClick={() => {
              setSection('menu');
              setRDone(false);
              setRAnswers({});
            }}
          >
            ← Back to IELTS
          </button>
          <div className="ph">📖 IELTS Academic Reading</div>
          <div className="passbox">
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              {IELTS_PASSAGE.title}
            </div>
            {IELTS_PASSAGE.text}
          </div>
          {!rDone ? (
            <>
              <div className="shed">Questions</div>
              {IELTS_PASSAGE.questions.map((q, i) => (
                <div key={q.id} className="qcard" style={{ marginBottom: 12 }}>
                  <div className="qtxt">
                    {i + 1}. {q.text}
                  </div>
                  <div className="qopts">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={`qopt ${rAnswers[q.id] === opt ? 'sel' : ''}`}
                        onClick={() => setRAnswers((a) => ({ ...a, [q.id]: opt }))}
                      >
                        <span style={{ fontWeight: 700, marginRight: 8, color: 'var(--g400)' }}>
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="btn btn-p"
                onClick={() => {
                  IELTS_PASSAGE.questions.forEach((q) => {
                    if (rAnswers[q.id] !== q.answer)
                      recordMistake(
                        'IELTS',
                        'Reading',
                        q.text,
                        q.answer,
                        rAnswers[q.id] || 'unanswered'
                      );
                  });
                  setRDone(true);
                }}
              >
                Submit Reading →
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{rScore >= 4 ? '🎉' : '💪'}</div>
              <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>
                Reading Complete!
              </div>
              <div className="band-badge">
                Score: {rScore} / {IELTS_PASSAGE.questions.length}
              </div>
              {IELTS_PASSAGE.questions.map((q, i) => {
                const correct = rAnswers[q.id] === q.answer;
                return (
                  <div
                    key={q.id}
                    style={{
                      background: correct ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${correct ? '#86efac' : '#fca5a5'}`,
                      borderRadius: 10,
                      padding: '10px 14px',
                      textAlign: 'left',
                      marginBottom: 8,
                      maxWidth: 520,
                      margin: '8px auto',
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                      {i + 1}. {q.text}
                    </div>
                    <div style={{ fontSize: 11.5, color: correct ? '#059669' : '#dc2626' }}>
                      {correct
                        ? '✓ Correct'
                        : `✗ You: ${rAnswers[q.id] || 'unanswered'} → Correct: ${q.answer}`}
                    </div>
                    {!correct && (
                      <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 3 }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                className="btn btn-o"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setRDone(false);
                  setRAnswers({});
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );

  // ── Writing ──
  if (section === 'writing')
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button
            className="back-btn"
            onClick={() => {
              setSection('menu');
              setEssayResult(null);
              setEssay('');
            }}
          >
            ← Back to IELTS
          </button>
          <div className="ph">✍️ IELTS Writing Task 2</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h4
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 10,
                color: 'var(--p)',
              }}
            >
              Task 2 Question
            </h4>
            <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>{IELTS_WRITING_PROMPT}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g600)' }}>
              Your Essay
            </label>
            <span style={{ fontSize: 12, color: 'var(--g400)' }}>
              {essay.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            className="essay-area"
            placeholder="Write your essay…"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              className="btn btn-p"
              onClick={checkEssay}
              disabled={checking || essay.trim().split(/\s+/).length < 50}
            >
              {checking ? 'Checking…' : 'Check Essay →'}
            </button>
          </div>
          {essayResult && (
            <div style={{ marginTop: 22 }}>
              <div className="band-badge">Band Score: {essayResult.band}</div>
              {essayResult.task_achievement && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
                  {[
                    ['Task Achievement', essayResult.task_achievement],
                    ['Coherence', essayResult.coherence],
                    ['Vocabulary', essayResult.vocabulary],
                    ['Grammar', essayResult.grammar],
                  ].map(([k, v]) => (
                    <div key={k} className="sscore">
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--p)' }}>{v}</div>
                      <div style={{ fontSize: 10, color: 'var(--g400)', lineHeight: 1.3 }}>{k}</div>
                    </div>
                  ))}
                </div>
              )}
              <div
                style={{
                  background: 'var(--p4)',
                  borderLeft: '3px solid var(--p2)',
                  padding: '12px 14px',
                  borderRadius: '0 8px 8px 0',
                  fontSize: 13,
                  lineHeight: 1.7,
                  marginBottom: 12,
                }}
              >
                {essayResult.feedback}
              </div>
              {essayResult.improvements?.length > 0 && (
                <div>
                  {essayResult.improvements.map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 8,
                        fontSize: 13,
                        marginBottom: 7,
                        color: 'var(--g600)',
                      }}
                    >
                      <span style={{ color: 'var(--p)', fontWeight: 700 }}>{i + 1}.</span>
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

  // ── Меню ──
  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="ph">🇬🇧 IELTS Preparation</div>
        <div className="ps">Cambridge-style tests, AI essay checker, speaking trainer.</div>
        <div className="g2">
          {[
            {
              id: 'reading',
              icon: '📖',
              title: 'Academic Reading',
              desc: 'Passages · 5 questions · Auto-scored',
            },
            {
              id: 'writing',
              icon: '✍️',
              title: 'Writing Task 2',
              desc: 'AI essay checker · Band 0–9 · Feedback',
            },
            {
              id: 'listening',
              icon: '🎧',
              title: 'Listening Test',
              desc: 'Audio player · Section questions · Auto-scored',
            },
            {
              id: 'speaking',
              icon: '🎤',
              title: 'Speaking Trainer',
              desc: 'Type your response · AI band score · Instant feedback',
            },
          ].map((s) => (
            <div key={s.id} className="ielts-sec" onClick={() => setSection(s.id)}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--g400)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
