import { useState, useEffect, useRef } from "react";
import { ORKHAN_Q, SEC_COLORS } from "../data/satExams.js";
import { recordMistake, recordTestScore } from "../utils/store.js";
import { fmtTime } from "../utils/ai.js";

export default function OrxhanExam({ onBack }) {
  const [phase, setPhase] = useState("intro");
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [grids, setGrids] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(3600);
  const [paused, setPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase !== "test" || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paused]);

  function start() {
    setPhase("test");
    setAnswers({});
    setGrids({});
    setFlagged(new Set());
    setTimeLeft(3600);
    setPaused(false);
  }

  function toggleFlag(id) {
    setFlagged((f) => {
      const n = new Set(f);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function submit() {
    clearInterval(timerRef.current);
    setShowConfirm(false);
    setPhase("results");
  }

  const q = ORKHAN_Q[cur];
  const answered = Object.keys(answers).length;

  function calcResults() {
    let correct = 0, wrong = 0, skipped = 0;
    const bySection = {};
    ORKHAN_Q.forEach((q) => {
      const given = answers[q.id];
      const isCorrect =
        q.type === "mcq"
          ? given === q.ans
          : String(given || "").trim() === String(q.correctAns);
      if (given === undefined || given === "") skipped++;
      else if (isCorrect) correct++;
      else {
        wrong++;
        recordMistake(
          "SAT Math",
          q.section,
          q.q.slice(0, 60),
          q.type === "mcq" ? q.opts[q.ans] : q.correctAns,
          q.type === "mcq" ? q.opts[given] || "?" : given
        );
      }
      if (!bySection[q.section]) bySection[q.section] = { correct: 0, total: 0 };
      bySection[q.section].total++;
      if (isCorrect) bySection[q.section].correct++;
    });
    return { correct, wrong, skipped, bySection };
  }

  if (phase === "intro")
    return (
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={onBack}>← Back to SAT</button>
        <div
          style={{
            background: "linear-gradient(145deg,#f5f3ff,#ede9fe,#fce7f3)",
            borderRadius: 20,
            padding: "36px 28px",
            maxWidth: 560,
            margin: "0 auto",
            textAlign: "center",
            boxShadow: "var(--shm)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--p4)",
              border: "1px solid #c4b5fd",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--p)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 20,
            }}
          >
            💜 Her Access · SAT Practice
          </div>
          <div style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Orkhan Khalilzade
          </div>
          <div
            style={{
              fontFamily: "'Lora',serif",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--p)",
              marginBottom: 20,
            }}
          >
            SAT Math — Exam 1
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            {[["40", "Questions"], ["60 min", "Time Limit"], ["MCQ + Grid", "Types"], ["4", "Sections"]].map(
              ([v, l]) => (
                <div
                  key={l}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--p3)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    textAlign: "center",
                    minWidth: 80,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lora',serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--p)",
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--g400)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {l}
                  </div>
                </div>
              )
            )}
          </div>
          <div
            style={{
              background: "var(--g50)",
              borderRadius: 12,
              padding: 16,
              textAlign: "left",
              marginBottom: 22,
            }}
          >
            {[
              "60 minutes — timer pauses when you click Pause",
              "Navigate freely between all 40 questions",
              "Flag questions to review before submitting",
              "MCQ: select A–D. Grid-in: type your answer",
              "Full score report with section breakdown after",
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--g600)",
                  marginBottom: 6,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "var(--p)", fontWeight: 700 }}>•</span>
                {r}
              </div>
            ))}
          </div>
          <button
            className="btn btn-p"
            style={{ width: "100%", justifyContent: "center", fontSize: 15 }}
            onClick={start}
          >
            Start Exam →
          </button>
        </div>
      </div>
    );

  if (phase === "results") {
    const { correct, wrong, skipped, bySection } = calcResults();
    const pct = Math.round((correct / 40) * 100);
    const timeUsed = 3600 - timeLeft;
    recordTestScore("sat_orkhan_exam1", correct, 40, "Orkhan Exam 1");
    return (
      <div className="rpage">
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="shero">
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                opacity: 0.8,
                marginBottom: 12,
              }}
            >
              Orkhan Exam 1 · SAT Math
            </div>
            <div className="snum">{correct}</div>
            <div style={{ fontSize: 18, opacity: 0.8, marginBottom: 16 }}>out of 40 questions</div>
            <div
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,.15)",
                borderRadius: 999,
                padding: "8px 24px",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {pct}% Correct
            </div>
          </div>
          <div className="g2" style={{ marginBottom: 20 }}>
            {[
              [`${correct} ✓`, "Correct", "#15803d"],
              [`${wrong} ✗`, "Wrong", "#b91c1c"],
              [`${skipped}`, "Skipped", "#92400e"],
              [fmtTime(timeUsed), "Time Used", "#1d4ed8"],
            ].map(([v, l, c]) => (
              <div key={l} className="dstat">
                <div className="dsv" style={{ color: c, WebkitTextFillColor: c }}>
                  {v}
                </div>
                <div className="dsl">{l}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="shed">📊 Section Breakdown</div>
            {Object.entries(bySection).map(([sec, data]) => {
              const p = Math.round((data.correct / data.total) * 100);
              const color = SEC_COLORS[sec] || "#6d28d9";
              return (
                <div key={sec} className="secbar">
                  <span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 120, color: "var(--g600)" }}>
                    {sec}
                  </span>
                  <div className="secbb">
                    <div className="secbf" style={{ width: `${p}%`, background: color }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 40, textAlign: "right" }}>
                    {data.correct}/{data.total}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="shed">📋 Full Answer Review</div>
            {ORKHAN_Q.map((q) => {
              const given = answers[q.id];
              const isSkipped = given === undefined || given === "";
              const isCorrect =
                !isSkipped &&
                (q.type === "mcq"
                  ? given === q.ans
                  : String(given).trim() === String(q.correctAns));
              const status = isSkipped ? "s" : isCorrect ? "c" : "w";
              const givenText = isSkipped
                ? "—"
                : q.type === "mcq"
                ? `${String.fromCharCode(65 + given)}. ${q.opts[given]}`
                : given;
              const correctText =
                q.type === "mcq" ? `${String.fromCharCode(65 + q.ans)}. ${q.opts[q.ans]}` : q.correctAns;
              return (
                <div key={q.id} className={`ritem ${status}`} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>
                    <b>Q{q.id}.</b> {q.q.length > 140 ? q.q.slice(0, 140) + "…" : q.q}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: isCorrect ? 0 : 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 9px",
                        borderRadius: 999,
                        background:
                          status === "c" ? "#dcfce7" : status === "w" ? "#fee2e2" : "#fef9c3",
                        color:
                          status === "c" ? "#15803d" : status === "w" ? "#b91c1c" : "#854d0e",
                      }}
                    >
                      {status === "c" ? "✓ Correct" : status === "w" ? "✗ Wrong" : "⚠ Skipped"}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        background: "var(--p4)",
                        color: "var(--p)",
                        padding: "2px 9px",
                        borderRadius: 999,
                        fontWeight: 600,
                      }}
                    >
                      {q.section}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div style={{ fontSize: 12, color: "var(--g600)", lineHeight: 1.6 }}>
                      {!isSkipped && (
                        <span>
                          Your answer: <b style={{ color: "#b91c1c" }}>{givenText}</b> ·{" "}
                        </span>
                      )}
                      Correct: <b style={{ color: "#15803d" }}>{correctText}</b>
                      <br />
                      <span style={{ color: "var(--g400)" }}>💡 {q.exp}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              paddingBottom: 32,
            }}
          >
            <button className="btn btn-o" onClick={() => { setPhase("intro"); setCur(0); }}>
              ↺ Retake
            </button>
            <button className="btn btn-p" onClick={onBack}>
              ← Back to SAT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {paused && (
        <div className="poverlay">
          <div className="pcard">
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏸</div>
            <div style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Test Paused
            </div>
            <p style={{ fontSize: 13.5, color: "var(--g600)", marginBottom: 24, lineHeight: 1.6 }}>
              Your progress is saved. Click Resume to continue.
            </p>
            <div
              style={{
                background: "var(--g50)",
                borderRadius: 10,
                padding: "10px 20px",
                fontFamily: "'Lora',serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              {fmtTime(timeLeft)} remaining
            </div>
            <button
              className="pbtn res"
              style={{ fontSize: 14, padding: "11px 28px", width: "100%", borderRadius: 999 }}
              onClick={() => setPaused(false)}
            >
              ▶ Resume
            </button>
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="modalbg">
          <div className="modal">
            <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
            <h3 style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Submit Test?
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--g600)", marginBottom: 22, lineHeight: 1.6 }}>
              {answered}/40 answered.{" "}
              {40 - answered > 0 ? `${40 - answered} unanswered.` : ""} Cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                style={{
                  padding: "11px 24px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: "var(--g100)",
                  color: "var(--g600)",
                  fontFamily: "'Outfit',sans-serif",
                }}
                onClick={() => setShowConfirm(false)}
              >
                Keep Going
              </button>
              <button
                style={{
                  padding: "11px 24px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: "var(--p)",
                  color: "#fff",
                  fontFamily: "'Outfit',sans-serif",
                }}
                onClick={submit}
              >
                Submit →
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="etbar">
        <div>
          <div style={{ fontFamily: "'Lora',serif", fontSize: 14, fontWeight: 700, color: "var(--p)" }}>
            Orkhan Exam 1
          </div>
          <div style={{ fontSize: 11, color: "var(--g400)" }}>SAT Math · 40 Questions</div>
        </div>
        <div className={`tbox ${timeLeft < 300 ? "warn" : ""} ${paused ? "paused" : ""}`}>
          {paused ? "PAUSED" : fmtTime(timeLeft)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`pbtn ${paused ? "res" : ""}`} onClick={() => setPaused((p) => !p)}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button className="sbtn" onClick={() => setShowConfirm(true)}>
            Submit
          </button>
        </div>
      </div>
      <div className="pstrip">
        <div className="pfstrip" style={{ width: `${(answered / 40) * 100}%` }} />
      </div>
      <div className="ebody">
        <div className="qpanel">
          <div className="qchdr">
            <div className="qhdr">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Lora',serif", fontSize: 20, fontWeight: 700 }}>
                  Q{q.id}
                </span>
                <span className="ttag">{q.type === "grid" ? "Grid-in" : "Multiple Choice"}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  className="stag"
                  style={{ background: SEC_COLORS[q.section] || "#6d28d9" }}
                >
                  {q.section}
                </span>
                <button
                  className={`fbtn ${flagged.has(q.id) ? "fl" : ""}`}
                  onClick={() => toggleFlag(q.id)}
                >
                  {flagged.has(q.id) ? "🚩 Flagged" : "🏳 Flag"}
                </button>
              </div>
            </div>
            <div className="qtext">{q.q}</div>
            {q.type === "mcq" ? (
              q.opts.map((opt, i) => (
                <button
                  key={i}
                  className={`eopt ${answers[q.id] === i ? "sel" : ""}`}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                >
                  <span className="eltr">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              ))
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--g400)",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Enter your answer
                </div>
                <input
                  type="text"
                  className={`ginput ${grids[q.id] ? "hv" : ""}`}
                  placeholder="Your answer"
                  value={grids[q.id] || ""}
                  onChange={(e) => {
                    setGrids((g) => ({ ...g, [q.id]: e.target.value }));
                    setAnswers((a) => ({ ...a, [q.id]: e.target.value }));
                  }}
                />
                <div style={{ fontSize: 11.5, color: "var(--g400)", lineHeight: 1.5 }}>
                  Enter a number or decimal. No units or degree symbols.
                </div>
              </div>
            )}
          </div>
          <div className="qnavb">
            <button className="nprev" onClick={() => setCur((c) => c - 1)} disabled={cur === 0}>
              ← Prev
            </button>
            <span style={{ fontSize: 12, color: "var(--g400)", fontWeight: 600 }}>
              {answered}/40
            </span>
            {cur < 39 ? (
              <button className="nnext" onClick={() => setCur((c) => c + 1)}>
                Next →
              </button>
            ) : (
              <button className="nnext" onClick={() => setShowConfirm(true)}>
                Submit →
              </button>
            )}
          </div>
        </div>
        <div className="navpanel">
          <div className="navc">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--g400)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Navigator
            </div>
            <div className="qng">
              {ORKHAN_Q.map((qq, i) => (
                <button
                  key={qq.id}
                  className={`qnb ${
                    answers[qq.id] !== undefined && answers[qq.id] !== "" ? "done" : ""
                  } ${i === cur ? "cur" : ""}`}
                  onClick={() => setCur(i)}
                  title={flagged.has(qq.id) ? "Flagged" : ""}
                >
                  {flagged.has(qq.id) ? "🚩" : qq.id}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                ["var(--p)", "Answered", answered],
                ["var(--g200)", "Unanswered", 40 - answered],
              ].map(([c, l, n]) => (
                <div
                  key={l}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--g400)" }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  {l} ({n})
                </div>
              ))}
              <div
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--g400)" }}
              >
                <span style={{ fontSize: 10 }}>🚩</span>Flagged ({flagged.size})
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid var(--g100)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--g400)",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  marginBottom: 8,
                }}
              >
                Sections
              </div>
              {Object.entries(SEC_COLORS).map(([s, c]) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--g600)",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }}
                  />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
