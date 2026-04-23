import { api } from './api.js';

export const progressApi = {
  // Dashboard — всё одним запросом
  getDashboard: () => api.get('/api/progress/dashboard'),

  // Lessons
  saveLesson: (data) => api.post('/api/progress/lessons', data),
  getLessons: () => api.get('/api/progress/lessons'),

  // Mistakes
  saveMistake: (data) => api.post('/api/progress/mistakes', data),
  getMistakes: () => api.get('/api/progress/mistakes'),
  getWeakTopics: () => api.get('/api/progress/weak-topics'),

  // Test scores
  saveTestScore: (data) => api.post('/api/progress/test-scores', data),
  getTestScores: () => api.get('/api/progress/test-scores'),
};
