import { useState } from 'react';
import { SUBJECTS } from '../data/subjects.js';
import { generateQuiz } from '../utils/ai.js';
import { recordTestScore } from '../utils/store.js';
import { videoUrl, LESSON_META } from '../utils/media.js';
import QuizEngine from '../components/QuizEngine.jsx';

export default function LessonPage({ lesson, setPage }) {
  const [phase, setPhase] = useState('content');
  const [questions, setQuestions] = useState([]);
  const [videoState, setVideoState] = useState('idle'); // idle | loading | playing | error
  const { subject, level } = lesson;
  const sd = SUBJECTS[subject];

  const src = videoUrl(subject, level.id);
  const meta = LESSON_META[subject]?.[level.id];

  async function startQuiz() {
    setPhase('loading');
    const qs = await generateQuiz(sd.label, level.title, level.topics, 10);
    setQuestions(qs);
    setPhase('quiz');
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={() => setPage('subjects')}>
          ← Back to Subjects
        </button>

        {phase === 'content' && (
          <>
            <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
              <span className="tag">{sd.label}</span>
              <span className="tag" style={{ background: 'var(--pink2)', color: 'var(--pink)' }}>
                {level.emoji} {level.title}
              </span>
            </div>
            <div className="ph">{level.title}</div>

            {/* ── Видео-плеер ── */}
            <div
              style={{
                borderRadius: 'var(--r)',
                overflow: 'hidden',
                maxWidth: 680,
                marginBottom: 22,
                background: '#0f0f1a',
                position: 'relative',
              }}
            >
              {videoState === 'error' ? (
                <div
                  style={{
                    aspectRatio: '16/9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    color: 'rgba(255,255,255,.6)',
                    fontSize: 13,
                    padding: 24,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 32 }}>📽️</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>Video coming soon</div>
                  <div style={{ fontSize: 12, opacity: 0.7, maxWidth: 340 }}>
                    This lesson video is being prepared. Use the AI Tutor — it covers all topics in
                    this lesson step by step.
                  </div>
                  <button
                    className="btn btn-o"
                    style={{ marginTop: 8, fontSize: 12, padding: '8px 18px' }}
                    onClick={() => setPage('tutor')}
                  >
                    Ask AI Tutor instead →
                  </button>
                </div>
              ) : (
                <video
                  key={src}
                  controls
                  preload="metadata"
                  style={{ width: '100%', display: 'block', aspectRatio: '16/9' }}
                  onLoadStart={() => setVideoState('loading')}
                  onCanPlay={() => setVideoState('playing')}
                  onError={() => setVideoState('error')}
                >
                  <source src={src} type="video/mp4" />
                  <source src={src.replace('.mp4', '.webm')} type="video/webm" />
                </video>
              )}

              {/* Метаданные поверх плеера до нажатия play */}
              {videoState === 'idle' && meta && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,.75))',
                    padding: '24px 16px 12px',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{meta.title}</div>
                  <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 2 }}>
                    {meta.duration}
                  </div>
                </div>
              )}
            </div>

            <div className="shed">📋 Topics Covered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {level.topics.map((t) => (
                <span
                  key={t}
                  style={{
                    background: 'var(--g100)',
                    color: 'var(--g600)',
                    fontSize: 12.5,
                    padding: '5px 12px',
                    borderRadius: 999,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="alert ai" style={{ maxWidth: 560 }}>
              🧠 After reviewing, take the AI-generated quiz — 10 questions based on exactly these
              topics.
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-p" onClick={startQuiz}>
                Start 10-Question Quiz →
              </button>
              <button className="btn btn-o" onClick={() => setPage('subjects')}>
                Back
              </button>
            </div>
          </>
        )}

        {phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Generating your quiz…
            </div>
            <div className="lds">
              <div className="ld" />
              <div className="ld" />
              <div className="ld" />
            </div>
          </div>
        )}

        {phase === 'quiz' && (
          <>
            <div className="shed">🧠 AI Quiz — {level.title}</div>
            <QuizEngine
              questions={questions}
              subject={sd.label}
              subjectKey={subject}
              levelTitle={level.title}
              levelId={level.id}
              onBack={() => setPage('subjects')}
              onComplete={(s, t) => {
                recordTestScore('lesson_quiz', s, t, `${sd.label}—${level.title}`);
                setPhase('done');
              }}
            />
          </>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>
              Lesson Complete!
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-o" onClick={() => setPage('subjects')}>
                More Subjects
              </button>
              <button className="btn btn-p" onClick={() => setPage('dashboard')}>
                Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
