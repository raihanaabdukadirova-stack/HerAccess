import { useState } from "react";
import { SUBJECTS } from "../data/subjects.js";
import { STORE, getWeakTopics, recordTestScore } from "../utils/store.js";
import { generateWeaknessQuiz } from "../utils/ai.js";
import QuizEngine from "../components/QuizEngine.jsx";

export default function DashboardPage({ user, setPage }) {
  const [view, setView] = useState("main");
  const [wqs, setWqs] = useState([]);
  const [lw, setLw] = useState(false);

  const weak = getWeakTopics(6);
  const completed = STORE.completedLessons.length;
  const testCount = STORE.testScores.length;
  const mistakeCount = STORE.mistakes.length;

  const sp = Object.entries(SUBJECTS).map(([k, s]) => {
    const sl = STORE.completedLessons.filter((l) => l.subjectKey === k);
    return {
      key: k,
      label: s.label,
      pct: Math.round((sl.length / s.levels.length) * 100),
      c: sl.length,
      t: s.levels.length,
    };
  });

  async function startWT() {
    if (!weak.length) return;
    setLw(true);
    const qs = await generateWeaknessQuiz(weak);
    setWqs(qs);
    setLw(false);
    setView("weakness");
  }

  if (view === "weakness")
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button className="back-btn" onClick={() => setView("main")}>
            ← Back to Dashboard
          </button>
          <div className="ph">🎯 Weakness-Based Quiz</div>
          <div className="ps">Personalized questions from your mistake history.</div>
          <QuizEngine
            questions={wqs}
            subject="Mixed"
            levelTitle="Your Weak Topics"
            onBack={() => setView("main")}
            onComplete={(s, t) => {
              recordTestScore("weakness", s, t, "Weakness Test");
              setView("main");
            }}
          />
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="ph">👋 {user?.name || "Student"}'s Dashboard</div>
        <div className="ps">Your learning progress, mistakes & personalized tests.</div>

        <div className="g2" style={{ marginBottom: 20 }}>
          {[
            [completed.toString(), "Lessons Completed"],
            [`${Math.min(completed + 1, 7)} 🔥`, "Day Streak"],
            [testCount.toString(), "Tests Taken"],
            [mistakeCount.toString(), "Mistakes Logged"],
          ].map(([v, l]) => (
            <div key={l} className="dstat">
              <div className="dsv">{v}</div>
              <div className="dsl">{l}</div>
            </div>
          ))}
        </div>

        {weak.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg,#fdf4ff,#fce7f3)",
              border: "1px solid #e9d5ff",
              borderRadius: "var(--r)",
              padding: 18,
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              🎯 Weakness Practice Available
            </div>
            <p style={{ fontSize: 13, color: "var(--g600)", marginBottom: 12 }}>
              Weak areas: {weak.slice(0, 3).map((w) => w.topic.split(":")[1]).join(", ")}.
            </p>
            <button
              className="btn btn-p"
              style={{ fontSize: 13, padding: "9px 20px" }}
              onClick={startWT}
              disabled={lw}
            >
              {lw ? "Generating…" : "Start Weakness Test →"}
            </button>
          </div>
        )}

        {!weak.length && !completed && (
          <div className="alert ai" style={{ marginBottom: 18 }}>
            👋 Complete lessons to build your profile!{" "}
            <button
              className="btn-sm bsp"
              style={{ marginLeft: 10 }}
              onClick={() => setPage("subjects")}
            >
              Start →
            </button>
          </div>
        )}

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="shed">📊 Subject Progress</div>
          {sp.map((s) => (
            <div key={s.key} className="prow">
              <span className="plbl">{s.label}</span>
              <div className="pbar">
                <div className="pfill" style={{ width: `${s.pct}%` }} />
              </div>
              <span className="ppct">
                {s.c}/{s.t}
              </span>
            </div>
          ))}
        </div>

        {STORE.mistakes.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="shed">❌ Recent Mistakes</div>
            {STORE.mistakes
              .slice(-5)
              .reverse()
              .map((m) => (
                <div key={m.id} className="mitem">
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.45 }}>
                    {m.question}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10.5, padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                        background: "#fef2f2", color: "#991b1b",
                      }}
                    >
                      You: {m.given}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5, padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                        background: "#f0fdf4", color: "#065f46",
                      }}
                    >
                      Correct: {m.correct}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5, padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                        background: "var(--p4)", color: "var(--p)",
                      }}
                    >
                      {m.subject} · {m.topic}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {STORE.testScores.length > 0 && (
          <div className="card">
            <div className="shed">📝 Test History</div>
            {STORE.testScores
              .slice(-6)
              .reverse()
              .map((ts, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 0",
                    borderBottom: "1px solid var(--g100)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {ts.type.replace(/_/g, " ").toUpperCase()}
                      {ts.section && ` · ${ts.section}`}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--g400)" }}>
                      {new Date(ts.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--p)" }}>
                    {ts.score}/{ts.total}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
