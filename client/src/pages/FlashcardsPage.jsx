import { useState } from "react";
import { FLASH_SETS } from "../data/flashcards.js";

export default function FlashcardsPage() {
  const [activeSet, setActiveSet] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [nf, setNf] = useState("");
  const [nb, setNb] = useState("");
  const [custom, setCustom] = useState([]);

  if (activeSet) {
    const cards = activeSet.id === "custom" ? custom : activeSet.cards;
    const card = cards[cardIdx % Math.max(1, cards.length)];
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 28 }}>
          <button
            className="back-btn"
            onClick={() => { setActiveSet(null); setCardIdx(0); setFlipped(false); }}
          >
            ← Back
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div>
              <div className="ph" style={{ fontSize: 20 }}>{activeSet.title}</div>
              <div style={{ fontSize: 12, color: "var(--g400)" }}>
                {cards.length} cards · {(cardIdx % Math.max(1, cards.length)) + 1}/{cards.length}
              </div>
            </div>
            <span className="tag">{activeSet.subject}</span>
          </div>
          {cards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--g400)" }}>
              🃏 No cards yet!
            </div>
          ) : (
            <div
              className={`fcard ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
              style={{ marginBottom: 20 }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--g400)",
                  marginBottom: 14,
                }}
              >
                {flipped ? "Answer" : "Question"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.45 }}>
                {flipped ? card.back : card.front}
              </div>
              <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 14 }}>
                {flipped ? "" : "Tap to flip"}
              </div>
            </div>
          )}
          {cards.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 22 }}>
              <button
                className="btn-sm bso"
                onClick={() => {
                  setCardIdx((i) => (i - 1 + cards.length) % cards.length);
                  setFlipped(false);
                }}
              >
                ← Prev
              </button>
              <button
                className="btn-sm bsp"
                onClick={() => {
                  setCardIdx((i) => (i + 1) % cards.length);
                  setFlipped(false);
                }}
              >
                Next →
              </button>
            </div>
          )}
          {activeSet.id === "custom" && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>➕ Add Card</div>
              <input
                style={{
                  width: "100%",
                  border: "2px solid var(--g200)",
                  borderRadius: 9,
                  padding: "9px 12px",
                  fontSize: 13,
                  fontFamily: "'Outfit',sans-serif",
                  outline: "none",
                  marginBottom: 8,
                }}
                placeholder="Front"
                value={nf}
                onChange={(e) => setNf(e.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  border: "2px solid var(--g200)",
                  borderRadius: 9,
                  padding: "9px 12px",
                  fontSize: 13,
                  fontFamily: "'Outfit',sans-serif",
                  outline: "none",
                  marginBottom: 10,
                }}
                placeholder="Back"
                value={nb}
                onChange={(e) => setNb(e.target.value)}
              />
              <button
                className="btn-sm bsp"
                onClick={() => {
                  if (nf && nb) {
                    setCustom((c) => [...c, { front: nf, back: nb }]);
                    setNf("");
                    setNb("");
                  }
                }}
              >
                Add Card
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="ph">🃏 Flashcards</div>
        <div className="ps">Spaced-repetition learning — curated sets or create your own.</div>
        <button
          className="btn btn-p"
          style={{ marginBottom: 22, fontSize: 13, padding: "10px 22px" }}
          onClick={() => setActiveSet({ id: "custom", title: "My Set", subject: "Custom" })}
        >
          ➕ Create New Set
        </button>
        <div className="g3">
          {FLASH_SETS.map((s) => (
            <div key={s.id} className="fset" onClick={() => setActiveSet(s)}>
              <h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{s.title}</h4>
              <p style={{ fontSize: 11.5, color: "var(--g400)" }}>{s.subject}</p>
              <span
                style={{
                  fontSize: 10.5,
                  background: "var(--p4)",
                  color: "var(--p)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 700,
                  display: "inline-block",
                  marginTop: 7,
                }}
              >
                {s.count} cards
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
