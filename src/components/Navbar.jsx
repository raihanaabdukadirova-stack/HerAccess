export default function Navbar({ page, setPage, user, setUser }) {
  const NAV = [
    { id: 'home', label: 'Home' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'sat', label: 'SAT' },
    { id: 'ielts', label: 'IELTS' },
    { id: 'tutor', label: 'AI Tutor' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="nav">
      <div className="brand" onClick={() => setPage('home')}>
        💜 Her Access
      </div>

      <div className="navl">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)}>
            {n.label}
          </button>
        ))}

        {!user ? (
          <button onClick={() => setPage('register')}>Get Started</button>
        ) : (
          <button onClick={() => setUser(null)}>Sign Out</button>
        )}
      </div>
    </nav>
  );
}
