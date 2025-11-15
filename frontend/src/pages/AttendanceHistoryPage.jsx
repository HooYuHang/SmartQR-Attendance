// src/pages/AttendanceHistoryPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";
import { useNavigate } from "react-router-dom";

export default function AttendanceHistoryPage() {
  const token = getAccessToken();
  const user = getUserInfo();
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!token || !user?.sub) return;

      setLoading(true);
      setError("");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/timetable/${user.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.timetable) {
          // ✅ Sort descending by date (latest first)
          const sorted = [...res.data.timetable].sort(
            (a, b) => new Date(b.classDate) - new Date(a.classDate)
          );

          setTimetable(sorted);
        } else {
          setError("No timetable data available");
        }
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
        setError("Failed to load attendance data. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchTimetable, 10000);
    return () => clearInterval(interval);
  }, [token, user?.sub]);

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "30px" }}>📅 Attendance History</h1>

      {/* Back to Dashboard */}
      <button
        onClick={() => navigate("/student/dashboard")}
        style={backButtonStyle}
      >
        Back to Dashboard
      </button>

      {loading && <p>Loading attendance history...</p>}
      {error && <p style={{ color: "orange" }}>{error}</p>}

      {!loading && !error && (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Class Room</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((cls) => {
                let statusColor = "white";
                if (cls.attendanceStatus === "present") statusColor = "#4caf50";
                else if (cls.attendanceStatus === "absent") statusColor = "orange";
                else if (cls.attendanceStatus === "fraud") statusColor = "#f44336";

                return (
                  <tr key={cls._id} style={trStyle}>
                    <td style={tdStyle}>{cls.subject}</td>
                    <td style={tdStyle}>{cls.classRoom}</td>
                    <td style={tdStyle}>{cls.classDate}</td>
                    <td style={tdStyle}>{cls.classTime}</td>
                    <td style={{ ...tdStyle, color: statusColor, fontWeight: "bold" }}>
                      {cls.attendanceStatus?.toUpperCase() || "ABSENT"}
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

// Styles
const containerStyle = {
  backgroundColor: "#1c1c1c",
  color: "#fff",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
  position: "relative",
};

const backButtonStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  padding: "12px 20px",
  backgroundColor: "#f44336",
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
};

const tableWrapperStyle = {
  width: "100%",
  maxWidth: "900px",
  overflowX: "auto",
  backgroundColor: "#222",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #fff",
  textAlign: "center",
  fontSize: "16px",
};

const trStyle = {
  borderBottom: "1px solid #555",
};

const tdStyle = {
  padding: "12px",
  textAlign: "center",
  fontSize: "16px",
};
