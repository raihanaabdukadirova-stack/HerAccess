import { useState } from "react";
import { SAT_LESSONS } from "../data/satExams.js";
import OrxhanExam from "../components/OrxhanExam.jsx";

export default function SATPage({ setPage }) {
  const [view, setView] = useState("menu");
  const [sec, setSec] = useState("rw");
  const [topic, setTopic] = useState(0);
  const tc = SAT_LESSONS[sec];

  if (view === "exam")
    return (
      <div className="page">
        <OrxhanExam onBack={() => setView("menu")} />
      </div>
    );

  if (view === "learn")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => setView("menu")}>
            ← Back to SAT
          </button>
          <div className="ph">📚 SAT Lessons</div>
          <div className="ps">Text-based lessons — structured and clear.</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {Object.entries(SAT_LESSONS).map(([k, s]) => (
              <button
                key={k}
                className={`sat-tab ${sec === k ? "act" : ""}`}
                onClick={() => { setSec(k); setTopic(0); }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {tc.sections.map((s, i) => (
              <button
                key={s.id}
                className={`sat-tab ${topic === i ? "act" : ""}`}
                onClick={() => setTopic(i)}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <h4
              style={{
                fontFamily: "'Lora',serif",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--p)",
              }}
            >
              {tc.sections[topic].title}
            </h4>
            <div
              style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--g600)" }}
              dangerouslySetInnerHTML={{
                __html: tc.sections[topic].content
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {topic > 0 && (
              <button className="btn-sm bso" onClick={() => setTopic((i) => i - 1)}>
                ← Prev
              </button>
            )}
            {topic < tc.sections.length - 1 && (
              <button className="btn-sm bsp" onClick={() => setTopic((i) => i + 1)}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="ph">🎓 SAT Preparation</div>
        <div className="ps">Study lessons first, then take the full practice exam.</div>
        <div className="g2" style={{ marginBottom: 24 }}>
          <div
            className="card"
            style={{ cursor: "pointer", border: "2px solid var(--p3)" }}
            onClick={() => setView("learn")}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>📚</div>
            <div
              style={{ fontFamily: "'Lora',serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}
            >
              SAT Lessons
            </div>
            <div style={{ fontSize: 13, color: "var(--g600)", lineHeight: 1.6, marginBottom: 14 }}>
              Structured text lessons covering all SAT topics — Reading & Writing and Math.
            </div>
            <button className="btn-sm bsp">Open Lessons →</button>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
              borderRadius: "var(--r)",
              padding: 24,
              color: "#fff",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => setView("exam")}
          >
            <div
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 56,
                opacity: 0.15,
              }}
            >
              📝
            </div>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📝</div>
            <div
              style={{ fontFamily: "'Lora',serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}
            >
              Orkhan Khalilzade
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, opacity: 0.9 }}>
              SAT Math — Exam 1
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6, marginBottom: 14 }}>
              40 real SAT Math questions · 60-min timer with pause · Full score report
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["40 Questions", "60 Minutes", "MCQ + Grid-in", "4 Sections"].map((l) => (
                <span
                  key={l}
                  style={{
                    background: "rgba(255,255,255,.15)",
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
            <button
              style={{
                background: "#fff",
                color: "var(--p)",
                border: "none",
                borderRadius: 999,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              Start Exam →
            </button>
          </div>
        </div>
        <div className="alert ai">
          💡 <strong>Tip:</strong> Study the lessons first, then take the exam. Mistakes are saved
          to your Dashboard for weakness-based review.
        </div>
      </div>
    </div>
  );
}
