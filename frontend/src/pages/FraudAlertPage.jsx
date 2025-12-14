import { useState, useEffect } from "react";
import { getAccessToken } from "../auth";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function FraudAlertPage() {
  const [frauds, setFrauds] = useState([]);
  const navigate = useNavigate();
  const token = getAccessToken();

  useEffect(() => {
    const fetchFraudAttempts = async () => {
      try {
        const res = await api.get(`/fraud/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFrauds(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch fraud alerts");
      }
    };
    fetchFraudAttempts();
  }, [token]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#333", color: "#fff", minHeight: "100vh" }}>
      <button
        onClick={() => navigate("/teacher/dashboard")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "14px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>

      <h2>Student Fraud Attempts</h2>

      {frauds.length === 0 ? (
        <p>No fraud attempts recorded.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #fff", padding: "8px" }}>Student</th>
              <th style={{ border: "1px solid #fff", padding: "8px" }}>Class</th>
              <th style={{ border: "1px solid #fff", padding: "8px" }}>Used IP</th>
              <th style={{ border: "1px solid #fff", padding: "8px" }}>Attempted At</th>
            </tr>
          </thead>
          <tbody>
            {frauds.map((f) => (
              <tr key={f._id}>
                <td style={{ border: "1px solid #fff", padding: "8px" }}>{f.studentName}</td>
                <td style={{ border: "1px solid #fff", padding: "8px" }}>{f.className}</td>
                <td style={{ border: "1px solid #fff", padding: "8px" }}>{f.usedIP}</td>
                <td style={{ border: "1px solid #fff", padding: "8px" }}>{new Date(f.attemptedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
