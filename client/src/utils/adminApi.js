import { api } from './api.js';

const qs = (params) => {
  if (!params) return '';
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const s = new URLSearchParams(filtered).toString();
  return s ? `?${s}` : '';
};

export const adminApi = {
  // ── Stats / Dashboard ──────────────────────────────────────────────
  getStats: () => api.get('/api/admin/stats'),

  // ── Users ──────────────────────────────────────────────────────────
  getUsers: (params) => api.get(`/api/admin/users${qs(params)}`),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  getUserProgress: (id) => api.get(`/api/admin/users/${id}/progress`),
  updateUserRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  banUser: (id, reason) => api.patch(`/api/admin/users/${id}/ban`, { banned: true, reason }),
  unbanUser: (id) => api.patch(`/api/admin/users/${id}/ban`, { banned: false }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  resetUserProgress: (id) => api.post(`/api/admin/users/${id}/reset-progress`),

  // ── Content: Subjects & Levels ─────────────────────────────────────
  getSubjects: () => api.get('/api/admin/content/subjects'),
  createSubject: (data) => api.post('/api/admin/content/subjects', data),
  updateSubject: (key, data) => api.patch(`/api/admin/content/subjects/${key}`, data),
  deleteSubject: (key) => api.delete(`/api/admin/content/subjects/${key}`),

  getLevels: (subjectKey) => api.get(`/api/admin/content/subjects/${subjectKey}/levels`),
  createLevel: (subjectKey, data) =>
    api.post(`/api/admin/content/subjects/${subjectKey}/levels`, data),
  updateLevel: (subjectKey, levelId, data) =>
    api.patch(`/api/admin/content/subjects/${subjectKey}/levels/${levelId}`, data),
  deleteLevel: (subjectKey, levelId) =>
    api.delete(`/api/admin/content/subjects/${subjectKey}/levels/${levelId}`),

  // ── Content: SAT ───────────────────────────────────────────────────
  getSATExams: () => api.get('/api/admin/content/sat/exams'),
  createSATExam: (data) => api.post('/api/admin/content/sat/exams', data),
  updateSATExam: (id, data) => api.patch(`/api/admin/content/sat/exams/${id}`, data),
  deleteSATExam: (id) => api.delete(`/api/admin/content/sat/exams/${id}`),

  getSATQuestions: (examId) =>
    api.get(`/api/admin/content/sat/exams/${examId}/questions`),
  createSATQuestion: (examId, data) =>
    api.post(`/api/admin/content/sat/exams/${examId}/questions`, data),
  updateSATQuestion: (qId, data) =>
    api.patch(`/api/admin/content/sat/questions/${qId}`, data),
  deleteSATQuestion: (qId) => api.delete(`/api/admin/content/sat/questions/${qId}`),
  reorderSATQuestions: (ids) =>
    api.post('/api/admin/content/sat/questions/reorder', { ids }),

  // ── Content: Flashcards ────────────────────────────────────────────
  getFlashcardSets: () => api.get('/api/admin/content/flashcards'),
  createFlashcardSet: (data) => api.post('/api/admin/content/flashcards', data),
  updateFlashcardSet: (id, data) =>
    api.patch(`/api/admin/content/flashcards/${id}`, data),
  deleteFlashcardSet: (id) => api.delete(`/api/admin/content/flashcards/${id}`),

  createCard: (setId, data) =>
    api.post(`/api/admin/content/flashcards/${setId}/cards`, data),
  updateCard: (setId, cardId, data) =>
    api.patch(`/api/admin/content/flashcards/${setId}/cards/${cardId}`, data),
  deleteCard: (setId, cardId) =>
    api.delete(`/api/admin/content/flashcards/${setId}/cards/${cardId}`),

  // ── Content: IELTS ─────────────────────────────────────────────────
  getIELTSPassages: () => api.get('/api/admin/content/ielts/passages'),
  createIELTSPassage: (data) => api.post('/api/admin/content/ielts/passages', data),
  updateIELTSPassage: (id, data) =>
    api.patch(`/api/admin/content/ielts/passages/${id}`, data),
  deleteIELTSPassage: (id) => api.delete(`/api/admin/content/ielts/passages/${id}`),

  // ── AI Logs ────────────────────────────────────────────────────────
  getAILogs: (params) => api.get(`/api/admin/ai-logs${qs(params)}`),

  // ── Settings ───────────────────────────────────────────────────────
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data) => api.patch('/api/admin/settings', data),
};
