import { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";
import { useNavigate } from "react-router-dom";

export default function ScanQRCodePage() {
  const token = getAccessToken();
  const user = getUserInfo();
  const navigate = useNavigate();

  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [qrImage, setQRImage] = useState(null);
  const [qrMessage, setQRMessage] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [detectedIP, setDetectedIP] = useState("Unknown");
  const [loadingMark, setLoadingMark] = useState(false);

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (!token || !user?.sub) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/timetable/${user.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEnrolledClasses(res.data.timetable || []);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setQRMessage("Failed to load classes. Please sign in again.");
      }
    };
    fetchEnrolledClasses();
  }, [token, user?.sub]);

  useEffect(() => {
    const fetchQR = async () => {
      if (!selectedClassId) return;

      setQRMessage("");
      setQRImage(null);
      setDetectedIP("Unknown");
      setAttendanceMessage("");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/classes/${selectedClassId}/latest-qr`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success && res.data.qrImage) {
          setQRImage(res.data.qrImage);
          setDetectedIP(res.data.qrIP || "Unknown");
        } else {
          setQRMessage(res.data.message || "QR code not available or expired.");
        }
      } catch (err) {
        console.error("Failed to fetch QR:", err);
        setQRMessage("QR code not available or expired.");
      }
    };

    fetchQR();
  }, [selectedClassId, token]);

  const handleMarkAttendance = async () => {
    if (!selectedClassId) return setAttendanceMessage("Please select a class.");
    if (!token) return setAttendanceMessage("Not authenticated. Please sign in.");

    setLoadingMark(true);
    setAttendanceMessage("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/classes/${selectedClassId}/mark-attendance`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        const status = res.data.status || "present";
        setAttendanceMessage(`✅ Attendance marked as ${status.toUpperCase()}`);
        setEnrolledClasses(prev =>
          prev.map(cls =>
            cls._id === selectedClassId ? { ...cls, attendanceStatus: status } : cls
          )
        );
      } else {
        setAttendanceMessage(`❌ ${res.data?.message || "Failed to mark attendance"}`);
      }
    } catch (err) {
      console.error("Attendance error:", err);
      const statusCode = err.response?.status;
      if (statusCode === 401) setAttendanceMessage("❌ Not authenticated. Please re-sign in.");
      else if (statusCode === 403) setAttendanceMessage("❌ Fraud detected: Wrong Wi-Fi network.");
      else if (statusCode === 400) setAttendanceMessage(`❌ ${err.response?.data?.message || "QR expired or not available."}`);
      else setAttendanceMessage("❌ Attendance failed. Try again.");
    } finally {
      setLoadingMark(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "30px" }}>Scan QR Code #️⃣</h1>

      <div style={{ marginBottom: "20px", width: "100%", maxWidth: "500px" }}>
        <select
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setAttendanceMessage("");
            setQRMessage("");
            setQRImage(null);
          }}
          style={selectStyle}
        >
          <option value="">Select a class</option>
          {enrolledClasses.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.subject} - {cls.classRoom} | {cls.classDate} {cls.classTime} | Status: {cls.attendanceStatus || "absent"}
            </option>
          ))}
        </select>
      </div>

      <p style={{ fontWeight: "bold" }}>Your IP (as backend sees): {detectedIP}</p>

      <div style={{ marginTop: "20px" }}>
        {qrImage && (
          <img
            src={qrImage}
            alt="QR Code"
            style={{ width: "300px", height: "300px", border: "3px solid #fff", borderRadius: "12px" }}
          />
        )}
        {!qrImage && qrMessage && <p style={{ color: "orange", marginTop: "10px" }}>{qrMessage}</p>}
      </div>

      {qrImage && (
        <button
          onClick={handleMarkAttendance}
          disabled={loadingMark}
          style={markButtonStyle}
        >
          {loadingMark ? "Marking..." : "Mark Attendance"}
        </button>
      )}

      {attendanceMessage && <p style={{ marginTop: "15px", fontWeight: "bold", color: "yellow" }}>{attendanceMessage}</p>}

      <button
        onClick={() => navigate("/student/dashboard")}
        style={backButtonStyle}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

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

const selectStyle = {
  padding: "12px",
  fontSize: "18px",
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #555",
  backgroundColor: "#2c2c2c",
  color: "#fff",
};

const markButtonStyle = {
  marginTop: "20px",
  padding: "14px 24px",
  backgroundColor: "#4caf50",
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontSize: "18px",
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
