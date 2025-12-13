import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";
import api from "../api";

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [filteredTimetable, setFilteredTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterSubject, setFilterSubject] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterWeek, setFilterWeek] = useState("");

  const navigate = useNavigate();
  const token = getAccessToken();
  const userInfo = getUserInfo();

  // ==============================
  // Fetch Timetable
  // ==============================
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(
          `/api/student/timetable/${userInfo.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data && res.data.success) {
          const sortedClasses = res.data.timetable.sort((b, a) => {
            const dateB = new Date(`${a.classDate}T${a.classTime}`);
            const dateA = new Date(`${b.classDate}T${b.classTime}`);
            return dateB - dateA;
          });
          setTimetable(sortedClasses);
          setFilteredTimetable(sortedClasses);
        }
      } catch (err) {
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [token, userInfo.sub]);

  // ==============================
  // Filter Logic
  // ==============================
  useEffect(() => {
    let filtered = [...timetable];

    if (filterSubject !== "") {
      filtered = filtered.filter(cls => cls.subject === filterSubject);
    }

    if (filterMonth !== "") {
      const [year, month] = filterMonth.split("-");
      filtered = filtered.filter(cls => {
        const d = new Date(cls.classDate);
        return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
      });
    }

    if (filterWeek !== "") {
      filtered = filtered.filter(cls => {
        const d = new Date(cls.classDate);
        const weekNumber = Math.ceil((d.getDate() - 1) / 7) + 1;
        return weekNumber === Number(filterWeek);
      });
    }

    setFilteredTimetable(filtered);
  }, [filterSubject, filterMonth, filterWeek, timetable]);

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

  // ==============================
  // Determine row style based on datetime
  // ==============================
  const getRowStyle = (cls) => {
    const classDateTime = new Date(`${cls.classDate}T${cls.classTime}`);
    const now = new Date();

    if (classDateTime < now) {
      return { backgroundColor: "#555", color: "#ccc" }; // Past classes
    } else if (
      classDateTime.toDateString() === now.toDateString()
    ) {
      return { backgroundColor: "#FF9800", color: "#000" }; // Today
    } else {
      return { backgroundColor: "#2E7D32", color: "#fff" }; // Future classes
    }
  };

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

      {/* Back to Dashboard button */}
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

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Subjects</option>
          <option value="Cloud Engineering">Cloud Engineering</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Fintech">Fintech</option>
          <option value="General IT">General IT</option>
        </select>

        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={filterStyle}
        />

        <select
          value={filterWeek}
          onChange={(e) => setFilterWeek(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Weeks</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
          <option value="3">Week 3</option>
          <option value="4">Week 4</option>
          <option value="5">Week 5</option>
        </select>
      </div>

      {filteredTimetable.length === 0 ? (
        <p style={{ fontSize: "20px" }}>
          You are not enrolled in any classes yet.
        </p>
      ) : (
        <table
          style={{
            width: "90%",
            maxWidth: "900px",
            borderCollapse: "collapse",
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
            {filteredTimetable.map((cls) => (
              <tr key={cls._id} style={{ textAlign: "center", ...getRowStyle(cls) }}>
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
                  {new Date(`2000-01-01T${cls.classTime}`).toLocaleTimeString("en-US", {
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

/* Styles */
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

const filterStyle = {
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "#2c2c2c",
  border: "1px solid #555",
  color: "#fff",
};
