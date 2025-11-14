import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = getAccessToken();
  const userInfo = getUserInfo();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/timetable/${userInfo.sub}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.success) {
          // Sort by date + time descending (defensive - backend already sorts)
          const sortedClasses = res.data.timetable.sort((b, a) => {
            const dateB = new Date(`${a.classDate}T${a.classTime}`);
            const dateA = new Date(`${b.classDate}T${b.classTime}`);
            return dateB - dateA;
          });
          setTimetable(sortedClasses);
        }
      } catch (err) {
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [token, userInfo.sub]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#333",
          color: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "22px",
        }}
      >
        Loading your timetable...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        color: "#fff",
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "36px", marginBottom: "30px", color: "#4CAF50" }}>
        📅 My Class Timetable
      </h1>
      {/* Back to Dashboard button at top-right */}
      <button
        onClick={() => navigate("/student/dashboard")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Back to Dashboard
      </button>
      {timetable.length === 0 ? (
        <p style={{ fontSize: "20px" }}>
          You are not enrolled in any classes yet.
        </p>
      ) : (
        <table
          style={{
            width: "90%",
            maxWidth: "900px",
            borderCollapse: "collapse",
            backgroundColor: "#333",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#444" }}>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Classroom</th>
              <th style={thStyle}>Teacher</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((cls) => (
              <tr key={cls._id} style={{ textAlign: "center" }}>
                <td style={tdStyle}>{cls.subject}</td>
                <td style={tdStyle}>{cls.classRoom}</td>
                <td style={tdStyle}>{cls.teacherName || "Unknown"}</td>
                <td style={tdStyle}>
                {new Date(cls.classDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                </td>
                <td style={tdStyle}>
                {new Date(`2000-01-01T${cls.classTime}`)
                  .toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td style={tdStyle}>{cls.classDuration} mins</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "15px",
  borderBottom: "2px solid #555",
  fontSize: "18px",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #555",
  fontSize: "16px",
};
