import axios from "axios";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export async function markAttendance(sessionId, studentId) {
  try {
    const res = await api.post(`${API_BASE}/attendance/mark`, {
      sessionId,
      studentId,
    });
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}
