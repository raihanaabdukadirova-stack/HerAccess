import { useState } from "react";
import { recordMistake, recordLesson } from "../utils/store.js";

// subject     — display-название для UI ("Physics")
// subjectKey  — ключ для БД ("physics")
// levelTitle  — display-название уровня для UI ("Elementary Physics")
// levelId     — id уровня для БД ("ph1")
export default function QuizEngine({ questions, subject, subjectKey, levelTitle, levelId, onComplete, onBack }) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

  if (!questions || questions.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--g400)" }}>
        No questions available.
      </div>
    );

  const q = questions[idx];
  const total = questions.length;

  function answer(i) {
    if (answered !== null) return;
    setAnswered(i);
    if (i === q.ans) setScore((s) => s + 1);
    else recordMistake(subject, q.topic || levelTitle, q.q, q.opts[q.ans], q.opts[i]);
    setResults((r) => [...r, { question: q, chosen: i, correct: i === q.ans }]);
  }

  function next() {
    if (idx >= total - 1) {
      const finalScore = score + (answered === q.ans ? 1 : 0);
      // subjectKey и levelId — валидные ключи для БД
      // subject и levelTitle — только для отображения в UI
      recordLesson(subjectKey || subject, levelId || levelTitle, finalScore);
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setAnswered(null);
    }
  }

  if (done) {
    const fs = results.filter((r) => r.correct).length;
    const pct = Math.round((fs / total) * 100);
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>
          {pct >= 80 ? "🎉" : pct >= 60 ? "💪" : "📖"}
        </div>
        <div className="ph" style={{ fontSize: 22, marginBottom: 8 }}>
          Quiz Complete!
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg,#6d28d9,#db2777)",
            color: "#fff",
            padding: "12px 26px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 18,
            margin: "12px 0 20px",
          }}
        >
          {fs}/{total} ({pct}%)
        </div>
        {pct < 80 && (
          <div className="alert aw" style={{ maxWidth: 460, margin: "0 auto 16px" }}>
            📌 {total - fs} mistake(s) saved to your Dashboard weakness tracker!
          </div>
        )}
        <div
          style={{
            background: "var(--g50)",
            borderRadius: "var(--r)",
            padding: 16,
            maxWidth: 500,
            margin: "0 auto 20px",
            textAlign: "left",
          }}
        >
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: "#fff",
                border: `1px solid ${r.correct ? "#86efac" : "#fca5a5"}`,
                marginBottom: 7,
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
                {r.question.q}
              </div>
              <div style={{ fontSize: 11.5, color: r.correct ? "#059669" : "#dc2626" }}>
                {r.correct ? "✓ " : "✗ "}Your answer: {r.question.opts[r.chosen]}
                {!r.correct && (
                  <span style={{ color: "var(--g600)" }}>
                    {" "}→ Correct: {r.question.opts[r.question.ans]}
                  </span>
                )}
              </div>
              {!r.correct && (
                <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 3 }}>
                  💡 {r.question.exp}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {onBack && (
            <button className="btn-sm bso" onClick={onBack}>
              ← Back
            </button>
          )}
          <button className="btn-sm bsp" onClick={() => onComplete && onComplete(fs, total)}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span className="tag">
          {subject} · {levelTitle}
        </span>
        <span style={{ fontSize: 12, color: "var(--g400)", fontWeight: 600 }}>
          Q {idx + 1}/{total}
        </span>
      </div>
      <div className="pbar" style={{ marginBottom: 18 }}>
        <div className="pfill" style={{ width: `${(idx / total) * 100}%` }} />
      </div>
      <div className="qcard">
        <div className="qtxt">{q.q}</div>
        <div className="qopts">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              className={`qopt${
                answered !== null
                  ? i === q.ans
                    ? " correct"
                    : i === answered
                    ? " wrong"
                    : ""
                  : ""
              }`}
              onClick={() => answer(i)}
              disabled={answered !== null}
            >
              <span style={{ fontWeight: 700, marginRight: 8, color: "var(--g400)" }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          ))}
        </div>
        {answered !== null && <div className="qexp">💡 {q.exp}</div>}
        <div className="qnav">
          <span style={{ fontSize: 12, color: "var(--g400)" }}>
            Score: {score}/{idx + (answered !== null ? 1 : 0)}
          </span>
          {answered !== null && (
            <button className="btn-sm bsp" onClick={next}>
              {idx >= total - 1 ? "Finish →" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
