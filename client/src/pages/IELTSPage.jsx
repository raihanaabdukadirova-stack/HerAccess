import { useState } from "react";
import { IELTS_PASSAGE, IELTS_WRITING_PROMPT } from "../data/ielts.js";
import { api } from "../utils/api.js";
import { recordMistake, recordTestScore } from "../utils/store.js";

export default function IELTSPage({ setPage }) {
  const [section, setSection] = useState("menu");
  const [rAnswers, setRAnswers] = useState({});
  const [rDone, setRDone] = useState(false);
  const [essay, setEssay] = useState("");
  const [checking, setChecking] = useState(false);
  const [essayResult, setEssayResult] = useState(null);

  async function checkEssay() {
    if (essay.trim().split(/\s+/).length < 50) return;
    setChecking(true);
    setEssayResult(null);
    try {
      const result = await api.post("/api/ai/essay", { essay });
      setEssayResult(result);
      recordTestScore("ielts_writing", 0, 9, "Writing");
    } catch {
      setEssayResult({ band: "—", feedback: "Unable to evaluate. Try again.", improvements: [] });
    } finally {
      setChecking(false);
    }
  }

  const rScore = rDone
    ? IELTS_PASSAGE.questions.filter((q) => rAnswers[q.id] === q.answer).length
    : 0;

  if (section === "menu")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <div className="ph">🇬🇧 IELTS Preparation</div>
          <div className="ps">Cambridge-style tests, AI essay checker, speaking trainer.</div>
          <div className="g2">
            {[
              { id: "reading",  icon: "📖", title: "Academic Reading",  desc: "Passages · 5 questions · Auto-scored" },
              { id: "writing",  icon: "✍️", title: "Writing Task 2",    desc: "AI essay checker · Band 0–9 · Feedback" },
              { id: "listening",icon: "🎧", title: "Listening Test",    desc: "Audio player · Section questions" },
              { id: "speaking", icon: "🎤", title: "Speaking Trainer",  desc: "AI conversation · Fluency feedback" },
            ].map((s) => (
              <div key={s.id} className="ielts-sec" onClick={() => setSection(s.id)}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--g400)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (section === "reading")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => { setSection("menu"); setRDone(false); setRAnswers({}); }}>
            ← Back to IELTS
          </button>
          <div className="ph">📖 IELTS Academic Reading</div>
          <div className="passbox">
            <div style={{ fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              {IELTS_PASSAGE.title}
            </div>
            {IELTS_PASSAGE.text}
          </div>
          {!rDone ? (
            <>
              <div className="shed">Questions</div>
              {IELTS_PASSAGE.questions.map((q, i) => (
                <div key={q.id} className="qcard" style={{ marginBottom: 12 }}>
                  <div className="qtxt">{i + 1}. {q.text}</div>
                  <div className="qopts">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={`qopt ${rAnswers[q.id] === opt ? "sel" : ""}`}
                        onClick={() => setRAnswers((a) => ({ ...a, [q.id]: opt }))}
                      >
                        <span style={{ fontWeight: 700, marginRight: 8, color: "var(--g400)" }}>
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
                      recordMistake("IELTS", "Reading", q.text, q.answer, rAnswers[q.id] || "unanswered");
                  });
                  setRDone(true);
                }}
              >
                Submit Reading →
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{rScore >= 4 ? "🎉" : "💪"}</div>
              <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>Reading Complete!</div>
              <div className="band-badge">Score: {rScore} / {IELTS_PASSAGE.questions.length}</div>
              {IELTS_PASSAGE.questions.map((q, i) => {
                const correct = rAnswers[q.id] === q.answer;
                return (
                  <div key={q.id} style={{
                    background: correct ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${correct ? "#86efac" : "#fca5a5"}`,
                    borderRadius: 10, padding: "10px 14px",
                    textAlign: "left", marginBottom: 8, maxWidth: 520, margin: "8px auto",
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                      {i + 1}. {q.text}
                    </div>
                    <div style={{ fontSize: 11.5, color: correct ? "#059669" : "#dc2626" }}>
                      {correct ? "✓ Correct" : `✗ You: ${rAnswers[q.id] || "unanswered"} → Correct: ${q.answer}`}
                    </div>
                    {!correct && (
                      <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 3 }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
              <button className="btn btn-o" style={{ marginTop: 16 }} onClick={() => { setRDone(false); setRAnswers({}); }}>
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );

  if (section === "writing")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => { setSection("menu"); setEssayResult(null); setEssay(""); }}>
            ← Back to IELTS
          </button>
          <div className="ph">✍️ IELTS Writing Task 2</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, marginBottom: 10, color: "var(--p)" }}>
              Task 2 Question
            </h4>
            <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>{IELTS_WRITING_PROMPT}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--g600)" }}>Your Essay</label>
            <span style={{ fontSize: 12, color: "var(--g400)" }}>
              {essay.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            className="essay-area"
            placeholder="Write your essay…"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              className="btn btn-p"
              onClick={checkEssay}
              disabled={checking || essay.trim().split(/\s+/).length < 50}
            >
              {checking ? "Checking…" : "Check Essay →"}
            </button>
          </div>
          {essayResult && (
            <div style={{ marginTop: 22 }}>
              <div className="band-badge">Band Score: {essayResult.band}</div>
              {essayResult.task_achievement && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                  {[
                    ["Task Achievement", essayResult.task_achievement],
                    ["Coherence",        essayResult.coherence],
                    ["Vocabulary",       essayResult.vocabulary],
                    ["Grammar",          essayResult.grammar],
                  ].map(([k, v]) => (
                    <div key={k} className="sscore">
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--p)" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--g400)", lineHeight: 1.3 }}>{k}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{
                background: "var(--p4)", borderLeft: "3px solid var(--p2)",
                padding: "12px 14px", borderRadius: "0 8px 8px 0",
                fontSize: 13, lineHeight: 1.7, marginBottom: 12,
              }}>
                {essayResult.feedback}
              </div>
              {essayResult.improvements?.length > 0 && (
                <div>
                  {essayResult.improvements.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 7, color: "var(--g600)" }}>
                      <span style={{ color: "var(--p)", fontWeight: 700 }}>{i + 1}.</span>
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

  if (section === "listening")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => setSection("menu")}>← Back</button>
          <div className="ph">🎧 IELTS Listening</div>
          <div style={{ background: "var(--g100)", borderRadius: "var(--r)", padding: 20, textAlign: "center", marginTop: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Section 1 — Conversation at a travel agency
            </div>
            <button style={{ background: "var(--p)", color: "#fff", border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              ▶ Play Audio
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={() => setSection("menu")}>← Back</button>
        <div className="ph">🎤 IELTS Speaking Trainer</div>
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, marginBottom: 10, color: "var(--p)" }}>
            Speaking Part 2
          </h4>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {`Describe a time when you helped someone.\n\nYou should say:\n• Who you helped\n• What you did\n• Why you helped them\n\nSpeak for 1–2 minutes.`}
          </div>
        </div>
        <div className="alert ai" style={{ marginBottom: 16 }}>
          💡 Write your response in the AI Tutor for instant fluency feedback.
        </div>
        <button className="btn btn-p" onClick={() => setPage("tutor")}>
          Open AI Tutor →
        </button>
      </div>
    </div>
  );
}
