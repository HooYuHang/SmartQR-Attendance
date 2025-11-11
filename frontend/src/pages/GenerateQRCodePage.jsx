import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GenerateQRCodePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const navigate = useNavigate();

  const handleGenerateQRCode = async () => {
    const response = await fetch("http://localhost:5000/api/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass }),
    });
    const data = await response.json();
    if (data.success) {
      setQrCode(data.qrCode);
    } else {
      alert("Failed to generate QR code");
    }
  };

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
      <h2>Generate QR Code for Attendance</h2>
      <input
        type="text"
        placeholder="Enter Class ID"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleGenerateQRCode} style={{ padding: "10px 20px" }}>
        Generate QR Code
      </button>
      {qrCode && <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />}
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
