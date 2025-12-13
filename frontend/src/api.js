import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default api;
export async function markAttendance(sessionId, studentId) {
  try {
    const res = await axios.post(`${API_BASE}/attendance/mark`, {
      sessionId,
      studentId,
    });
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
}
