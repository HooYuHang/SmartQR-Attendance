import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ScanQRCodePage() {
  const [qrCode, setQrCode] = useState("");
  const navigate = useNavigate();

  const handleScanQRCode = async () => {
    const response = await fetch(`http://localhost:5000/api/scan-qr/${qrCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.success) {
      alert("Attendance marked successfully");
    } else {
      alert("Failed to mark attendance");
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
      <h2>Scan QR Code to Mark Attendance</h2>
      <input
        type="text"
        placeholder="Enter QR Code"
        value={qrCode}
        onChange={(e) => setQrCode(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleScanQRCode} style={{ padding: "10px 20px" }}>
        Scan QR Code
      </button>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
