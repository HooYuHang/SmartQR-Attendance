import { useState } from "react";
import axios from "axios";

function HomePage() {
  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState(null);

  const generateQR = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/attendance/generate/${sessionId}`
    );
    setQrData(res.data);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Teacher Dashboard – Generate QR</h2>
      <input
        type="text"
        placeholder="Enter session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      />
      <button onClick={generateQR}>Generate QR</button>

      {qrData && (
        <div style={{ marginTop: "20px" }}>
          <img src={qrData.qrDataUrl} alt="QR Code" width="200" />
          <p>
            <strong>Session URL: </strong>
            <a href={qrData.url} target="_blank">{qrData.url}</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
