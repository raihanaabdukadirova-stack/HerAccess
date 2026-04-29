import * as adminService from "./admin.service.js";

// GET /api/admin/stats
export async function getStatsController(_req, res) {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
}

// ─── Users (§2.2) ─────────────────────────────────────────────────────────────

// GET /api/admin/users
export async function listUsersController(req, res) {
  const data = await adminService.listUsers(req.query);
  res.json(data);
}

// GET /api/admin/users/:id
export async function getUserDetailController(req, res) {
  const user = await adminService.getUserDetail(req.params.id);
  res.json({ user });
}

// PATCH /api/admin/users/:id/role
export async function updateUserRoleController(req, res) {
  const user = await adminService.updateUserRole(req.user.id, req.params.id, req.body.role);
  res.json({ user });
}

// PATCH /api/admin/users/:id/ban
export async function setUserBanController(req, res) {
  const user = await adminService.setUserBan(
    req.user.id,
    req.params.id,
    !!req.body.banned,
    req.body.reason
  );
  res.json({ user });
}

// DELETE /api/admin/users/:id
export async function deleteUserController(req, res) {
  await adminService.deleteUser(req.user.id, req.params.id);
  res.json({ message: "User deleted." });
}

// GET /api/admin/users/:id/progress
export async function getUserProgressController(req, res) {
  const progress = await adminService.getUserProgress(req.params.id);
  res.json(progress);
}

// POST /api/admin/users/:id/reset-progress
export async function resetUserProgressController(req, res) {
  await adminService.resetUserProgress(req.params.id);
  res.json({ message: "Progress reset." });
}

// ─── Settings (§2.5) ──────────────────────────────────────────────────────────

// GET /api/admin/settings
export async function getSettingsController(_req, res) {
  const data = await adminService.getSettings();
  res.json(data);
}

// PATCH /api/admin/settings
export async function updateSettingsController(req, res) {
  const data = await adminService.updateSettings(req.user.id, req.body);
  res.json(data);
}

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
