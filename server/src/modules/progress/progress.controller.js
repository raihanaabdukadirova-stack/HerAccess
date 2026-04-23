import * as progressService from "./progress.service.js";

// GET /api/progress/dashboard
export async function dashboardController(req, res) {
  const data = await progressService.getDashboard(req.user.id);
  res.json(data);
}

// POST /api/progress/lessons
export async function saveLessonController(req, res) {
  const { subjectKey, levelId, score } = req.body;
  const result = await progressService.saveLesson(req.user.id, { subjectKey, levelId, score });
  res.status(201).json(result);
}

// GET /api/progress/lessons
export async function getLessonsController(req, res) {
  const lessons = await progressService.getLessons(req.user.id);
  res.json(lessons);
}

// POST /api/progress/mistakes
export async function saveMistakeController(req, res) {
  const { subject, topic, question, correct, given } = req.body;
  const result = await progressService.saveMistake(req.user.id, {
    subject, topic, question, correct, given,
  });
  res.status(201).json(result);
}

// GET /api/progress/mistakes
export async function getMistakesController(req, res) {
  const mistakes = await progressService.getMistakes(req.user.id);
  res.json(mistakes);
}

// GET /api/progress/weak-topics
export async function getWeakTopicsController(req, res) {
  const topics = await progressService.getWeakTopics(req.user.id);
  res.json(topics);
}

// POST /api/progress/test-scores
export async function saveTestScoreController(req, res) {
  const { type, score, total, section } = req.body;
  const result = await progressService.saveTestScore(req.user.id, {
    type, score, total, section,
  });
  res.status(201).json(result);
}

// GET /api/progress/test-scores
export async function getTestScoresController(req, res) {
  const scores = await progressService.getTestScores(req.user.id);
  res.json(scores);
}
