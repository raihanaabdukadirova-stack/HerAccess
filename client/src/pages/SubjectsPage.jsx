import { useState } from "react";
import { SUBJECTS } from "../data/subjects.js";

export default function SubjectsPage({ setPage, setLesson }) {
  const [active, setActive] = useState("physics");
  const s = SUBJECTS[active];

  return (
    <div className="page">
      <div className="wrap" style={{ paddingTop: 28 }}>
        <div className="ph">📚 Subjects</div>
        <div className="ps">Choose a subject, pick a level, start learning.</div>

        <div className="g3" style={{ marginBottom: 28 }}>
          {Object.entries(SUBJECTS).map(([k, sv]) => (
            <div
              key={k}
              className={`scard ${active === k ? "act" : ""}`}
              onClick={() => setActive(k)}
            >
              <div style={{ fontSize: 26, marginBottom: 7 }}>{sv.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--g600)" }}>{sv.label}</div>
            </div>
          ))}
        </div>

        <div className="shed">
          {s.icon} {s.label}
        </div>
        {s.levels.map((lv) => (
          <div
            key={lv.id}
            className="litem"
            onClick={() => {
              setLesson({ subject: active, level: lv });
              setPage("lesson");
            }}
          >
            <div style={{ fontSize: 18, minWidth: 24 }}>{lv.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 7 }}>{lv.title}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {lv.topics.slice(0, 4).map((t) => (
                  <span key={t} className="tchip">
                    {t}
                  </span>
                ))}
                {lv.topics.length > 4 && (
                  <span className="tchip">+{lv.topics.length - 4}</span>
                )}
              </div>
            </div>
            <span style={{ color: "var(--g400)", fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
