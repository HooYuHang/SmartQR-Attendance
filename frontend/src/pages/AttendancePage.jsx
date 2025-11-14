import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../auth";

export default function AttendancePage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const token = getAccessToken();

  const [attendanceData, setAttendanceData] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const classRes = await axios.get(
          `http://localhost:5000/api/classes/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClassInfo(classRes.data);

        const attRes = await axios.get(
          `http://localhost:5000/api/classes/${classId}/attendance`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (attRes.data.success) {
          setAttendanceData(attRes.data.attendance || []);
        } else {
          setErrorMsg(attRes.data.message || "No attendance data found");
        }
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setErrorMsg("Error fetching attendance. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [classId, token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const d = new Date(`2000-01-01T${timeStr}`);
    return isNaN(d.getTime())
      ? "Invalid Time"
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      minHeight: "100vh",
      backgroundColor: "#222",
      color: "#fff",
      padding: "30px",
      fontSize: "18px",
      textAlign: "center",
    }}>
      <button
        onClick={() => navigate("/teacher/dashboard")}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          alignSelf: "flex-end",
          marginBottom: "25px"
        }}
      >
        Back to Dashboard
      </button>

      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Class Attendance 📝</h1>

      {classInfo ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "25px" }}>
          <strong>{classInfo.subject || "N/A"}</strong> | Classroom: {classInfo.classRoom || "N/A"} | Date:{" "}
          {formatDate(classInfo.classDate)} | Time: {formatTime(classInfo.classTime)}
        </p>
      ) : (
        <p>Loading class info...</p>
      )}

      {loading ? (
        <p>Loading attendance...</p>
      ) : errorMsg ? (
        <p style={{ color: "orange", fontSize: "1.1rem" }}>{errorMsg}</p>
      ) : attendanceData.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <div style={{ overflowX: "auto", width: "100%", maxWidth: "1000px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", fontSize: "1rem" }}>
            <thead>
              <tr>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Fraud</th>
                <th style={thStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((att) => (
                <tr key={att._id} style={{ backgroundColor: att.isFraud ? "#422826" : "#333" }}>
                  <td style={tdStyle}>{att.studentName}</td>
                  <td style={tdStyle}>{att.studentEmail}</td>
                  <td style={{ ...tdStyle, color: att.status === "present" ? "#4caf50" : "#ff9800" }}>
                    {att.status?.toUpperCase() || "N/A"}
                  </td>
                  <td style={{ ...tdStyle, color: att.isFraud ? "#f44336" : "#4caf50" }}>
                    {att.isFraud ? "YES" : "NO"}
                  </td>
                  <td style={tdStyle}>
                    {att.timestamp ? new Date(att.timestamp).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  borderBottom: "2px solid #fff",
  padding: "12px",
  textAlign: "center",
  fontSize: "1.1rem",
};

const tdStyle = {
  borderBottom: "1px solid #555",
  padding: "10px",
  textAlign: "center",
  fontSize: "1rem",
};
