import { useState } from 'react';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import FlashcardsPage from './pages/FlashcardsPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';

import './styles/global.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);

  function renderPage() {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} user={user} />;

      case 'flashcards':
        return <FlashcardsPage />;

      case 'dashboard':
        return <DashboardPage user={user} setPage={setPage} />;

      case 'login':
      case 'register':
        return <AuthPage mode={page} setPage={setPage} setUser={setUser} />;

      default:
        return <HomePage setPage={setPage} user={user} />;
    }
  }

  return (
    <Layout page={page} setPage={setPage} user={user} setUser={setUser}>
      {renderPage()}
    </Layout>
  );
}
