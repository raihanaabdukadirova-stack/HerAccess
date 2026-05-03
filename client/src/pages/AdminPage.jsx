import { useState } from 'react';
import '../styles/admin.css';

import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminUsers from './admin/AdminUsers.jsx';
import AdminUserDetail from './admin/AdminUserDetail.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminAILogs from './admin/AdminAILogs.jsx';

function ComingSoon({ title }) {
  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>{title}</h1>
          <p>This screen lands in a later stage.</p>
        </div>
      </div>
      <div className="admin-card">
        <div style={{ color: 'var(--g400)', fontSize: 13 }}>
          Backend is not wired up yet — placeholder.
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ user, setPage }) {
  const [section, setSection] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="page">
        <div className="wrap" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "'Lora',serif", fontSize: 22, fontWeight: 700 }}>
            Access Denied
          </h2>
          <p style={{ fontSize: 13, color: '#a1a1aa', margin: '8px 0 18px' }}>
            This page requires Admin privileges.
          </p>
          <button className="btn btn-p" onClick={() => setPage('home')}>
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  function changeSection(next) {
    setSelectedUserId(null);
    setSection(next);
  }

  let body;
  switch (section) {
    case 'dashboard':
      body = <AdminDashboard />;
      break;
    case 'users':
      body = selectedUserId ? (
        <AdminUserDetail
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
        />
      ) : (
        <AdminUsers
          currentUserId={user.id}
          onOpenDetail={(id) => setSelectedUserId(id)}
        />
      );
      break;
    case 'analytics':
      body = <ComingSoon title="Analytics" />;
      break;
    case 'ai-logs':
      body = <AdminAILogs />;
      break;
    case 'settings':
      body = <AdminSettings />;
      break;
    case 'subjects':
      body = <ComingSoon title="Subjects & Levels" />;
      break;
    case 'sat':
      body = <ComingSoon title="SAT Exams" />;
      break;
    case 'ielts':
      body = <ComingSoon title="IELTS" />;
      break;
    case 'flashcards':
      body = <ComingSoon title="Flashcards" />;
      break;
    default:
      body = <AdminDashboard />;
  }

  return (
    <AdminLayout section={section} setSection={changeSection}>
      {body}
    </AdminLayout>
  );
}
