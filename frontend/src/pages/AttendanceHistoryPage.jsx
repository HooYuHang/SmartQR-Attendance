import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AttendanceHistoryPage() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      const response = await fetch("http://localhost:5000/api/attendance-history");
      const data = await response.json();
      setHistory(data);
    };

    fetchAttendanceHistory();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#333",
        color: "#fff",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2>Your Attendance History</h2>
      <ul>
        {history.map((item) => (
          <li key={item.id}>{`${item.subject} - ${item.status} (${item.date})`}</li>
        ))}
      </ul>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
