const TOP_LEVEL = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'users', icon: '👥', label: 'Users' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'ai-logs', icon: '🤖', label: 'AI Logs' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const CONTENT_SECTIONS = [
  { id: 'subjects', label: 'Subjects & Levels' },
  { id: 'sat', label: 'SAT Exams' },
  { id: 'ielts', label: 'IELTS' },
  { id: 'flashcards', label: 'Flashcards' },
];

export default function AdminLayout({ section, setSection, children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>🛡️</span>
          <span>Her Access · Admin</span>
        </div>

        <div className="admin-nav-group-label">Main</div>
        {TOP_LEVEL.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-nav-item ${section === item.id ? 'act' : ''}`}
            onClick={() => setSection(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="admin-nav-group-label">Content</div>
        {CONTENT_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-nav-item ${section === item.id ? 'act' : ''}`}
            onClick={() => setSection(item.id)}
          >
            <span className="icon">📁</span>
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
