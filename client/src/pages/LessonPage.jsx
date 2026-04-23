import { useState } from "react";
import { SUBJECTS } from "../data/subjects.js";
import { generateQuiz } from "../utils/ai.js";
import { recordTestScore } from "../utils/store.js";
import QuizEngine from "../components/QuizEngine.jsx";

export default function LessonPage({ lesson, setPage }) {
  const [phase, setPhase] = useState("content");
  const [questions, setQuestions] = useState([]);
  const { subject, level } = lesson;
  const sd = SUBJECTS[subject];

  async function startQuiz() {
    setPhase("loading");
    const qs = await generateQuiz(sd.label, level.title, level.topics, 10);
    setQuestions(qs);
    setPhase("quiz");
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <button className="back-btn" onClick={() => setPage("subjects")}>
          ← Back to Subjects
        </button>

        {phase === "content" && (
          <>
            <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
              <span className="tag">{sd.label}</span>
              <span className="tag" style={{ background: "var(--pink2)", color: "var(--pink)" }}>
                {level.emoji} {level.title}
              </span>
            </div>
            <div className="ph">{level.title}</div>
            <div
              style={{
                background: "linear-gradient(135deg,#1a003a,#2d0058)",
                borderRadius: "var(--r)",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 22,
                maxWidth: 680,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: "rgba(255,255,255,.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                ▶
              </div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>
                Video lesson — tap to play
              </div>
            </div>
            <div className="shed">📋 Topics Covered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {level.topics.map((t) => (
                <span
                  key={t}
                  style={{
                    background: "var(--g100)",
                    color: "var(--g600)",
                    fontSize: 12.5,
                    padding: "5px 12px",
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
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-p" onClick={startQuiz}>
                Start 10-Question Quiz →
              </button>
              <button className="btn btn-o" onClick={() => setPage("subjects")}>
                Back
              </button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
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

        {phase === "quiz" && (
          <>
            <div className="shed">
              🧠 AI Quiz — {level.title}
            </div>
            <QuizEngine
              questions={questions}
              subject={sd.label}
              levelTitle={level.title}
              onBack={() => setPage("subjects")}
              onComplete={(s, t) => {
                recordTestScore("lesson_quiz", s, t, `${sd.label}—${level.title}`);
                setPhase("done");
              }}
            />
          </>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div className="ph" style={{ fontSize: 20, marginBottom: 8 }}>
              Lesson Complete!
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-o" onClick={() => setPage("subjects")}>
                More Subjects
              </button>
              <button className="btn btn-p" onClick={() => setPage("dashboard")}>
                Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
