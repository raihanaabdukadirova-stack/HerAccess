const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "subjects", label: "Subjects" },
  { id: "sat", label: "SAT" },
  { id: "ielts", label: "IELTS" },
  { id: "tutor", label: "AI Tutor" },
  { id: "flashcards", label: "Flashcards" },
  { id: "dashboard", label: "Dashboard" },
];

export default function Navbar({ page, nav, user, setUser }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  function handleNav(p) {
    nav(p);
    setMenuOpen(false);
  }

  return (
    <nav className="nav">
      <div className="brand" onClick={() => handleNav("home")}>
        <div className="bi">💜</div>
        <div className="bn">Her Access</div>
      </div>
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
          <button
            className="nb cta"
            onClick={() => {
              setUser(null);
              handleNav("home");
            }}
          >
            Sign Out
          </button>
        )}
      </div>
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
