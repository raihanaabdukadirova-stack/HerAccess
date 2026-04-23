import { useState } from "react";

const NAV_ITEMS = [
  { id: "home",       label: "Home" },
  { id: "subjects",   label: "Subjects" },
  { id: "sat",        label: "SAT" },
  { id: "ielts",      label: "IELTS" },
  { id: "tutor",      label: "AI Tutor" },
  { id: "flashcards", label: "Flashcards" },
  { id: "dashboard",  label: "Dashboard" },
];

export default function Navbar({ page, nav, user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(p) {
    nav(p);
    setMenuOpen(false);
  }

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <nav className="nav">
      {/* Логотип */}
      <div className="brand" onClick={() => handleNav("home")}>
        <div className="bi">💜</div>
        <div className="bn">Her Access</div>
      </div>

      {/* Ссылки */}
      <div className={`navl ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            className={`nb ${page === n.id ? "act" : ""}`}
            onClick={() => handleNav(n.id)}
          >
            {n.label}
          </button>
        ))}

        {!user ? (
          <button className="nb cta" onClick={() => handleNav("register")}>
            Get Started
          </button>
        ) : (
          <>
            {/* Аватар → профиль */}
            <button
              onClick={() => handleNav("profile")}
              title={user.name}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: page === "profile"
                  ? "linear-gradient(135deg,#6d28d9,#db2777)"
                  : "var(--p4)",
                border: page === "profile" ? "none" : "2px solid #c4b5fd",
                color: page === "profile" ? "#fff" : "var(--p)",
                fontSize: 11, fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {initials}
            </button>

            <button
              className="nb"
              style={{ color: "#b91c1c" }}
              onClick={() => { setUser(null); handleNav("home"); }}
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Гамбургер */}
      <button className="ham" onClick={() => setMenuOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          {menuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
    </nav>
  );
}
