import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateClassPage() {
  const [subject, setSubject] = useState("");
  const [classRoom, setClassRoom] = useState("");
  const [classDate, setClassDate] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classDuration, setClassDuration] = useState(120); // default 2 hours
  const [weeks, setWeeks] = useState(1); // NEW: number of weeks
  const [subjects, setSubjects] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/available-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setSubjects(data.subjects || ["Mathematics", "Physics", "Chemistry"]);
        setClassRooms(data.classRooms || ["101", "102", "103", "104"]);
      } catch (error) {
        console.error("Error fetching available classes:", error);
      }
    };
    fetchAvailableClasses();
  }, [token]);

  const handleCreateClass = async () => {
    if (!subject || !classRoom || !classDate || !classTime || !classDuration) {
      alert("Please fill all fields including duration");
      return;
    }

    const response = await fetch("http://localhost:5000/api/classes", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ subject, classRoom, classDate, classTime, classDuration, weeks }),
    });

    const data = await response.json();
    if (data.success) {
      if (data.conflicts && data.conflicts.length > 0) {
        let message = "Some classes could not be created due to conflicts:\n";
        data.conflicts.forEach(c => {
          message += `Week ${c.week} (${c.classDate}): ${c.message}\n`;
        });
        alert(message);
      } else {
        alert("All classes created successfully!");
      }
      navigate("/teacher/dashboard");
    } else {
      alert(data.message || "Failed to create class");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#2c2c2c",
          padding: "40px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ marginBottom: "30px", fontSize: "2rem" }}>Create New Class 📚</h1>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        >
          <option value="" disabled>Select Subject</option>
          {subjects.map((subjectName) => (
            <option key={subjectName} value={subjectName}>{subjectName}</option>
          ))}
        </select>

        <select
          value={classRoom}
          onChange={(e) => setClassRoom(e.target.value)}
          style={inputStyle}
        >
          <option value="" disabled>Select Class Room</option>
          {classRooms.map((room) => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>

        <input
          type="date"
          value={classDate}
          onChange={(e) => setClassDate(e.target.value)}
          style={inputStyle}
        />

        <input
          type="time"
          value={classTime}
          onChange={(e) => setClassTime(e.target.value)}
          style={inputStyle}
        />

        <select
          value={classDuration}
          onChange={(e) => setClassDuration(Number(e.target.value))}
          style={inputStyle}
        >
          <option value={60}>60 minutes</option>
          <option value={90}>90 minutes</option>
          <option value={120}>120 minutes</option>
        </select>

        {/* NEW: Number of Weeks */}
        <select
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          style={inputStyle}
        >
          <option value={1}>1 week</option>
          <option value={2}>2 weeks</option>
          <option value={3}>3 weeks</option>
          <option value={4}>4 weeks</option>
          <option value={5}>5 weeks</option>
        </select>

        <button onClick={handleCreateClass} style={primaryButtonStyle}>
          Create Class
        </button>

        <button onClick={() => navigate("/teacher/dashboard")} style={secondaryButtonStyle}>
          Back
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  marginBottom: "15px",
  fontSize: "18px",
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #555",
  backgroundColor: "#1c1c1c",
  color: "#fff",
};

const primaryButtonStyle = {
  padding: "12px 24px",
  fontSize: "18px",
  backgroundColor: "#4CAF50",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  marginBottom: "10px",
};

const secondaryButtonStyle = {
  padding: "12px 24px",
  fontSize: "18px",
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};
