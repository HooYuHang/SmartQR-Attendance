import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const response = await fetch("http://localhost:5000/api/attendance");
      const data = await response.json();
      setAttendanceData(data);
    };

    fetchAttendanceData();
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
      <h2>Attendance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Fraud Check</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((item) => (
            <tr key={item.id}>
              <td>{item.studentName}</td>
              <td>{item.status}</td>
              <td>{item.isFraud ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
