import * as adminService from "./admin.service.js";

// GET /api/admin/tests
export async function getAllTestsController(req, res) {
  const tests = await adminService.getAllTests();
  res.json({ tests });
}

// GET /api/admin/tests/:id
export async function getTestByIdController(req, res) {
  const test = await adminService.getTestById(req.params.id);
  res.json({ test });
}

// POST /api/admin/tests
export async function createTestController(req, res) {
  const test = await adminService.createTest(req.user.id, req.body);
  res.status(201).json({ test });
}

// PATCH /api/admin/tests/:id
export async function updateTestController(req, res) {
  const test = await adminService.updateTest(req.params.id, req.body);
  res.json({ test });
}

// DELETE /api/admin/tests/:id
export async function deleteTestController(req, res) {
  await adminService.deleteTest(req.params.id);
  res.json({ message: "Test deleted successfully." });
}

// PATCH /api/admin/tests/:id/publish
export async function publishTestController(req, res) {
  const test = await adminService.publishTest(req.params.id, req.body.isPublished);
  res.json({ test });
}

// ─── Questions ────────────────────────────────────────────────────────────────

// POST /api/admin/tests/:testId/questions
export async function addQuestionController(req, res) {
  const question = await adminService.addQuestion(req.params.testId, req.body);
  res.status(201).json({ question });
}

// PATCH /api/admin/questions/:id
export async function updateQuestionController(req, res) {
  const question = await adminService.updateQuestion(req.params.id, req.body);
  res.json({ question });
}

// DELETE /api/admin/questions/:id
export async function deleteQuestionController(req, res) {
  await adminService.deleteQuestion(req.params.id);
  res.json({ message: "Question deleted successfully." });
}
