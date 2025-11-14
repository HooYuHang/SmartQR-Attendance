import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIdToken, getUserInfo, buildSignInUrl, logout } from "../auth";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getIdToken();
    const userInfo = getUserInfo();

    if (token && userInfo) {
      setIsLoggedIn(true);
      setUserRole(userInfo.role);
      setUserName(userInfo.name || "Unknown User");
      setLoading(false);

      // After a short delay, redirect to the appropriate dashboard
      setTimeout(() => {
        if (userInfo.role === "Teachers") {
          navigate("/teacher/dashboard");
        } else if (userInfo.role === "Students") {
          navigate("/student/dashboard");
        }
      }, 2000); // Delay of 2 seconds for "Welcome" message
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogin = () => {
    const loginUrl = buildSignInUrl();
    window.location.href = loginUrl;
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");
    navigate("/");
  };

  if (loading) {
    return <h1 style={{ fontSize: "28px", color: "#fff" }}>Loading...</h1>;
  }

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
          borderRadius: "8px",
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {!isLoggedIn ? (
          <>
            <h1 style={{ fontSize: "48px", marginBottom: "30px" }}>
              Welcome to SmartQR Attendance
            </h1>
            <p style={{ fontSize: "24px", marginBottom: "30px" }}>
              Please sign in to continue.
            </p>
            <button
              onClick={handleLogin}
              style={{
                padding: "15px 35px",
                fontSize: "22px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
            >
              Login
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "40px", marginTop: "30px" }}>
              Welcome, <strong>{userName}</strong> (<span>{userRole}</span>)
            </h1>
            <p style={{ fontSize: "24px", marginBottom: "40px" }}>
              Redirecting you to your dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
