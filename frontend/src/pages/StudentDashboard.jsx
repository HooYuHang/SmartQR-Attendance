import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../auth";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false); // Logout buffering

  useEffect(() => {
    const userInfo = getUserInfo();

    if (userInfo) {
      setUserName(userInfo.name || "Unknown User");
      setUserRole(userInfo.role || "Student");
      setLoading(false);
    } else {
      navigate("/"); // Redirect if no user info
    }
  }, [navigate]);

  const handleLogout = () => {
    setLoggingOut(true); // Start buffering
    setTimeout(() => {
      localStorage.clear();
      navigate("/"); // Redirect after delay
    }, 1200);
  };

  if (loading) {
    return <h1 style={{ fontSize: "28px", color: "#fff" }}>Loading...</h1>;
  }

  const optionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2c2c2c",
    color: "#4CAF50",
    padding: "18px 25px",
    marginBottom: "18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "20px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
  };

  const handleHover = (e, isHover) => {
    e.currentTarget.style.backgroundColor = isHover ? "#3a3a3a" : "#2c2c2c";
    e.currentTarget.style.transform = isHover ? "scale(1.03)" : "scale(1)";
  };

  const logoutStyle = {
    padding: "15px 35px",
    fontSize: "22px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease, transform 0.3s ease",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#1a1a1a",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "80%",
          maxWidth: "1000px",
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#333",
          color: "#fff",
          borderRadius: "12px",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1 style={{ fontSize: "40px", marginTop: "30px" }}>🎓 Student Dashboard</h1>
        <p style={{ fontSize: "24px", marginTop: "20px" }}>
          Welcome, <strong>{userName}</strong>! You're logged in as <span>{userRole}</span>.
        </p>

        {/* Your Options Section */}
        <div
          style={{
            marginTop: "50px",
            textAlign: "left",
            fontSize: "22px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h2 style={{ fontSize: "28px", marginBottom: "25px", color: "#4CAF50" }}>
            🧭 Your Options:
          </h2>

          <a
            href="/student/dashboard/timetable"
            style={optionStyle}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
          >
            <span>📅 My Class Timetable</span> ➜
          </a>

          <a
            href="/student/dashboard/scan-qr"
            style={optionStyle}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
          >
            <span>📷 Mark Attendance</span> ➜
          </a>

          <a
            href="/student/dashboard/attendance-history"
            style={optionStyle}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
          >
            <span>📊 View Attendance History</span> ➜
          </a>

          <a
            href="/student/dashboard/fraud-alerts"
            style={optionStyle}
            onMouseOver={(e) => handleHover(e, true)}
            onMouseOut={(e) => handleHover(e, false)}
          >
            <span>🚨 Fraud Alerts</span> ➜
          </a>
        </div>

        {/* Logout Button */}
        <div style={{ marginTop: "60px" }}>
          <button
            onClick={handleLogout}
            style={logoutStyle}
            disabled={loggingOut} // Disable while logging out
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#e53935";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#f44336";
              e.target.style.transform = "scale(1)";
            }}
          >
            {loggingOut ? "⏳ Logging out..." : "🔒 Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
