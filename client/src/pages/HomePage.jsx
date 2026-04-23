export default function HomePage({ setPage, user }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="badge">💜 Free · Global · AI-Powered</div>
        <h1>
          Knowledge is your
          <br />
          <em>greatest freedom</em>
        </h1>
        <p>
          Her Access gives girls in restricted regions free, world-class education — from basics to
          university level, powered by AI that learns from your mistakes.
        </p>
        <div className="hbtns">
          <button
            className="btn btn-p"
            onClick={() => setPage(user ? "subjects" : "register")}
          >
            {user ? "Continue Learning →" : "Start Learning — Free"}
          </button>
          <button className="btn btn-o" onClick={() => setPage("tutor")}>
            Ask AI Tutor
          </button>
        </div>
      </div>

      <div className="stats">
        {[["8", "Subjects"], ["SAT & IELTS", "Test Prep"], ["AI", "Tutor 24/7"], ["0", "Cost"]].map(
          ([n, l]) => (
            <div key={l} className="stat">
              <div className="n">{n}</div>
              <div className="l">{l}</div>
            </div>
          )
        )}
      </div>

      <div style={{ padding: "52px 18px", background: "var(--g50)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'Lora',serif",
                fontSize: "clamp(22px,4vw,32px)",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Everything you need to succeed
            </div>
            <div
              style={{ color: "var(--g400)", fontSize: 14, maxWidth: 480, margin: "0 auto" }}
            >
              Lessons, AI quizzes, SAT & IELTS, AI tutor, real practice tests, and smart progress
              tracking.
            </div>
          </div>
          <div className="g2">
            {[
              ["🧠", "AI-Generated Quizzes", "10 questions per lesson, created by AI from exactly your topics."],
              ["🎯", "Weakness-Based Tests", "Mistakes are saved and used to build personalized review tests."],
              ["📊", "Real Progress Tracking", "Per-subject progress, mistake history, and personalized recommendations."],
              ["📝", "Orkhan SAT Exam 1", "40 real SAT Math questions with 60-min timer, pause, and full score report."],
              ["🤖", "AI Tutor (24/7)", "Step-by-step answers in any subject, any time."],
              ["🃏", "Smart Flashcards", "Spaced repetition sets for vocabulary, formulas, and more."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="card">
                <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "var(--g600)", lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "52px 18px",
          textAlign: "center",
          background: "linear-gradient(145deg,#faf5ff,#fce7f3)",
        }}
      >
        <div
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "clamp(22px,4vw,32px)",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Your future starts today.
        </div>
        <p
          style={{
            color: "var(--g600)",
            maxWidth: 460,
            margin: "0 auto 24px",
            fontSize: 14,
            lineHeight: 1.75,
          }}
        >
          Join thousands of girls building brighter futures. No cost, no barriers, no limits.
        </p>
        <button
          className="btn btn-p"
          onClick={() => setPage(user ? "subjects" : "register")}
        >
          {user ? "Go to My Dashboard" : "Create Free Account"}
        </button>
      </div>
    </div>
  );
}
