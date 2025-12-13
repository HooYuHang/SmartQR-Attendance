import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../auth";
import api from "../api";

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

        // Fetch class details
        const classRes = await api.get(
          `/api/classes/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClassInfo(classRes.data);

        // Fetch attendance (correct backend route)
        const attRes = await api.get(
          `/api/classes/${classId}/attendance`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (attRes.data.success) {
          const processed = attRes.data.attendance.map((a) => ({
            ...a,
            studentName: a.studentName || a.name || "Unknown",
            studentEmail: a.studentEmail || a.email || "Unknown",
          }));

          const sorted = processed.sort((a, b) =>
            a.studentName.localeCompare(b.studentName)
          );

          setAttendanceData(sorted);
        } else {
          setErrorMsg(attRes.data.message || "No attendance found");
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
    return !isNaN(d.getTime()) ? d.toLocaleDateString() : "Invalid Date";
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const d = new Date(`2000-01-01T${timeStr}`);
    return !isNaN(d.getTime())
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Invalid Time";
  };

  return (
    <div style={containerStyle}>
      {/* NEW Back button to TeacherClassesPage */}
      <button
        onClick={() => navigate("/teacher/dashboard/classes")}
        style={smallBackButtonStyle}
      >
        ← Back
      </button>

      {/* Keep your original Back to Dashboard button */}
      <button
        onClick={() => navigate("/teacher/dashboard")}
        style={backButtonStyle}
      >
        Back to Dashboard
      </button>

      <h1 style={titleStyle}>Class Attendance 📝</h1>

      {classInfo ? (
        <p style={classInfoStyle}>
          <strong>{classInfo.subject || "N/A"}</strong> | Classroom:{" "}
          {classInfo.classRoom || "N/A"} | Date:{" "}
          {formatDate(classInfo.classDate)} | Time:{" "}
          {formatTime(classInfo.classTime)}
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
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
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
              {attendanceData.map((att) => {
                const isPresent = att.status === "present";
                const isAbsent = att.status === "absent";
                const isFraud = att.isFraud;

                return (
                  <tr
                    key={att._id || att.studentId}
                    style={{
                      backgroundColor: isFraud
                        ? "#422826"
                        : isPresent
                        ? "#1e3d25"
                        : "#333",
                    }}
                  >
                    <td style={tdStyle}>{att.studentName}</td>
                    <td style={tdStyle}>{att.studentEmail}</td>

                    <td
                      style={{
                        ...tdStyle,
                        color: isPresent
                          ? "#4caf50"
                          : isAbsent
                          ? "#ff9800"
                          : "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {att.status?.toUpperCase() || "UNKNOWN"}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color: isFraud ? "#f44336" : "#4caf50",
                        fontWeight: "bold",
                      }}
                    >
                      {isFraud ? "YES" : "NO"}
                    </td>

                    <td style={tdStyle}>
                      {att.timestamp
                        ? new Date(att.timestamp).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ========== STYLES ========== */

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#222",
  color: "#fff",
  padding: "30px",
  textAlign: "center",
};

/* Your original button (kept) */
const backButtonStyle = {
  padding: "12px 24px",
  fontSize: "16px",
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  alignSelf: "flex-end",
  marginBottom: "25px",
};

/* New small back button to class list */
const smallBackButtonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  backgroundColor: "#555",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  alignSelf: "flex-start",
  marginBottom: "15px",
};

const titleStyle = {
  fontSize: "2rem",
  marginBottom: "20px",
};

const classInfoStyle = {
  textAlign: "center",
  fontSize: "1.1rem",
  marginBottom: "25px",
};

const tableWrapperStyle = {
  overflowX: "auto",
  width: "100%",
  maxWidth: "1000px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  fontSize: "1rem",
};

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
