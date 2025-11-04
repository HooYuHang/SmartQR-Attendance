import { useParams } from "react-router-dom";
import { useState } from "react";
import { markAttendance } from "../api";

function ScanPage() {
  const { sessionId } = useParams();
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const res = await markAttendance(sessionId, studentId);
    setResult(res);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>QR Scanned Successfully 📱</h2>
      <p>Session ID: <b>{sessionId}</b></p>
      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <button onClick={handleSubmit}>Mark Attendance</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          {result.error ? (
            <p style={{ color: "red" }}>❌ {result.error}</p>
          ) : (
            <p style={{ color: "green" }}>✅ {result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ScanPage;
