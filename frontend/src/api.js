import axios from "axios";

const API_BASE = "http://localhost:5000";

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
