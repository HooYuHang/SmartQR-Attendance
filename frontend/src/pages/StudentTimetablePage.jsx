import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimetable = async () => {
      const response = await fetch("http://localhost:5000/api/timetable");
      const data = await response.json();
      setTimetable(data);
    };

    fetchTimetable();
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
      <h2>Your Timetable</h2>
      <ul>
        {timetable.map((item) => (
          <li key={item.id}>{`${item.subject} - ${item.className}`}</li>
        ))}
      </ul>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
