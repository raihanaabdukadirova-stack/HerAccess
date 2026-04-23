import { api } from "./api.js";

export const profileApi = {
  getProfile:     ()           => api.get("/api/profile"),
  updateName:     (name)       => api.patch("/api/profile/name", { name }),
  changePassword: (data)       => api.patch("/api/profile/password", data),
  deleteSession:  (sessionId)  => api.delete(`/api/profile/sessions/${sessionId}`),

  // DELETE с телом — пароль нужен серверу для подтверждения удаления
  deleteAccount:  (password)   => api.deleteWithBody("/api/profile", { password }),
};
