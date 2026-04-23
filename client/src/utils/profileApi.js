import { api } from "./api.js";

export const profileApi = {
  getProfile:      ()           => api.get("/api/profile"),
  updateName:      (name)       => api.patch("/api/profile/name", { name }),
  changePassword:  (data)       => api.patch("/api/profile/password", data),
  deleteSession:   (sessionId)  => api.delete(`/api/profile/sessions/${sessionId}`),
  deleteAccount:   (password)   => api.delete("/api/profile", { body: JSON.stringify({ password }) }),
};
