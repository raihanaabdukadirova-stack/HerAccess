import { useState } from "react";
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
import { STORE } from "./utils/store.js";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [lesson, setLesson] = useState(null);

  function nav(p) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  function handleSignOut() {
    setUser(null);
    STORE.user = null;
    nav("home");
  }

  return (
    <div className="app">
      <Navbar page={page} nav={nav} user={user} setUser={handleSignOut} />

      {page === "home" && <HomePage setPage={nav} user={user} />}
      {page === "subjects" && <SubjectsPage setPage={nav} setLesson={setLesson} />}
      {page === "lesson" && lesson && <LessonPage lesson={lesson} setPage={nav} />}
      {page === "tutor" && <TutorPage />}
      {page === "sat" && <SATPage setPage={nav} />}
      {page === "ielts" && <IELTSPage setPage={nav} />}
      {page === "flashcards" && <FlashcardsPage />}
      {page === "dashboard" && <DashboardPage user={user} setPage={nav} />}
      {(page === "login" || page === "register") && (
        <AuthPage mode={page} setPage={nav} setUser={setUser} />
      )}
    </div>
  );
}
