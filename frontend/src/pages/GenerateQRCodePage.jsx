import { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function GenerateQRCodePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [expiry, setExpiry] = useState(null);

  const navigate = useNavigate();
  const token = getAccessToken();
  const userInfo = getUserInfo();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(
          `/api/created-classes/${userInfo.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClasses(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, [token, userInfo.sub]);

  useEffect(() => {
    const fetchLatestQR = async () => {
      if (!selectedClass) {
        setQrImage(null);
        setExpiry(null);
        return;
      }

      try {
        const res = await api.get(
          `/api/classes/${selectedClass}/latest-qr`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setQrImage(res.data.qrImage);
          setExpiry(res.data.expiresAt);
        } else {
          setQrImage(null);
          setExpiry(null);
        }
      } catch (err) {
        console.error("Failed to fetch latest QR:", err);
        setQrImage(null);
        setExpiry(null);
      }
    };
    fetchLatestQR();
  }, [selectedClass, token]);

  const handleGenerateQR = async () => {
    if (!selectedClass) return alert("Select a class first");

    try {
      const res = await api.post(
        `/api/classes/${selectedClass}/generate-qr`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setQrImage(res.data.qrImage);
        setExpiry(res.data.expiry);
        alert("QR code generated and saved!");
      }
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      alert("Failed to generate QR code");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "40px",
      backgroundColor: "#222",
      color: "#fff",
      textAlign: "center",
      position: "relative",
      fontSize: "18px",
    }}>
      <button
        onClick={() => navigate("/teacher/dashboard")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "30px" }}>Generate QR Code for Attendance #️⃣</h1>

      <div style={{ marginBottom: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: "15px",
            fontSize: "18px",
            minWidth: "350px",
            borderRadius: "8px",
            border: "1px solid #fff",
            backgroundColor: "#333",
            color: "#fff",
          }}
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.subject} - {cls.classRoom} | {cls.classDate} {cls.classTime}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateQR}
          style={{
            padding: "15px 30px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
          }}
        >
          Generate QR
        </button>
      </div>

      {qrImage && (
        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <h2 style={{ fontSize: "1.8rem" }}>QR Code (expires in 3 minutes)</h2>
          <img
            src={qrImage}
            alt="QR Code"
            style={{ width: "300px", height: "300px", border: "4px solid #fff", borderRadius: "12px" }}
          />
        </div>
      )}
    </div>
  );
}
