import { useState, useEffect, useRef } from "react";
import { callAI } from "../utils/ai.js";

const CHIPS = [
  "Explain Newton's Laws",
  "Solve: 2x+5=13",
  "DNA replication?",
  "IELTS essay tips",
  "SAT quadratics",
  "What caused WWI?",
];

export default function TutorPage() {
  const [msgs, setMsgs] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI tutor 💜 I cover Physics, Math, Biology, Chemistry, History, Geography, English, Informatics — plus SAT & IELTS prep. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "usr", text: q }]);
    setLoading(true);
    try {
      const history = msgs.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));
      const reply = await callAI(
        "You are a warm expert AI tutor for 'Her Access' — free education for girls. Teach all subjects and SAT/IELTS prep. Explain step-by-step, use examples, be encouraging, keep responses concise for mobile.",
        [...history, { role: "user", content: q }].map((m) => `${m.role}: ${m.content}`).join("\n\n"),
        1000
      );
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: "Connection issue — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor-wrap">
      <div style={{ padding: "14px 0 8px" }}>
        <div className="ph" style={{ fontSize: 20 }}>🤖 AI Tutor</div>
        <div className="ps" style={{ marginBottom: 8 }}>Step-by-step answers, any subject.</div>
      </div>
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
            {m.role === "ai" && <div className="mname">Her Access AI</div>}
            <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
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
            if (e.key === "Enter" && !e.shiftKey) {
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
