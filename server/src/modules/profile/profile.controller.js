import * as profileService from "./profile.service.js";

// GET /api/profile
export async function getProfileController(req, res) {
  const data = await profileService.getProfile(req.user.id);
  res.json(data);
}

// PATCH /api/profile/name
export async function updateNameController(req, res) {
  const user = await profileService.updateName(req.user.id, req.body.name);
  res.json({ user });
}

// PATCH /api/profile/password
export async function changePasswordController(req, res) {
  const { currentPassword, newPassword } = req.body;
  await profileService.changePassword(req.user.id, { currentPassword, newPassword });

  // Сбрасываем refresh cookie — пользователь должен залогиниться заново
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Password changed. Please log in again." });
}

// DELETE /api/profile/sessions/:sessionId
export async function deleteSessionController(req, res) {
  await profileService.deleteSession(req.user.id, req.params.sessionId);
  res.json({ message: "Session removed." });
}

// DELETE /api/profile
export async function deleteAccountController(req, res) {
  await profileService.deleteAccount(req.user.id, req.body.password);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Account deleted." });
}
