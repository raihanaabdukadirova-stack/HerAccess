import { useState, useEffect } from "react";
import "./styles/global.css";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import SubjectsPage from "./pages/SubjectsPage.jsx";
import LessonPage from "./pages/LessonPage.jsx";
import TutorPage from "./pages/TutorPage.jsx";
import SATPage from "./pages/SATPage.jsx";
import IELTSPage from "./pages/IELTSPage.jsx";
import FlashcardsPage from "./pages/FlashcardsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { authApi, clearAccessToken } from "./utils/api.js";
import { STORE, loadUserProgress } from "./utils/store.js";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    authApi.restoreSession()
      .then(async (u) => {
        if (u) {
          STORE.user = u;
          setUser(u);
          await loadUserProgress();
        }
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, []);

  useEffect(() => {
    function onExpired() {
      STORE.user = null;
      setUser(null);
      clearAccessToken();
      nav("login");
    }
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  function nav(p) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  async function handleSetUser(u) {
    STORE.user = u;
    setUser(u);
    await loadUserProgress();
  }

  async function handleSignOut() {
    try { await authApi.logout(); } catch {}
    clearAccessToken();
    STORE.user = null;
    setUser(null);
    nav("home");
  }

  if (!sessionChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="lds">
          <div className="ld" /><div className="ld" /><div className="ld" />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar page={page} nav={nav} user={user} setUser={handleSignOut} />

      {page === "home"       && <HomePage      setPage={nav} user={user} />}
      {page === "subjects"   && <SubjectsPage  setPage={nav} setLesson={setLesson} />}
      {page === "lesson"     && lesson && <LessonPage lesson={lesson} setPage={nav} />}
      {page === "tutor"      && <TutorPage />}
      {page === "sat"        && <SATPage       setPage={nav} />}
      {page === "ielts"      && <IELTSPage     setPage={nav} />}
      {page === "flashcards" && <FlashcardsPage />}
      {page === "dashboard"  && <DashboardPage user={user} setPage={nav} />}
      {page === "profile"    && <ProfilePage   user={user} setUser={handleSetUser} setPage={nav} />}
      {(page === "login" || page === "register") && (
        <AuthPage mode={page} setPage={nav} setUser={handleSetUser} />
      )}
    </div>
  );
}
