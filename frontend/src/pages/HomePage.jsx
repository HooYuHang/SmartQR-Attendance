import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getIdToken, getUserInfo, buildSignInUrl, logout } from "../auth";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // Track user role
  const [userName, setUserName] = useState(""); // Track user's full name
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getIdToken();
    const userInfo = getUserInfo(); // Get user info (name, role)
    
    if (token && userInfo) {
      setIsLoggedIn(true); // Set user as logged in
      setUserRole(userInfo.role); // Set user role
      setUserName(userInfo.name || "Unknown User"); // Set the name, fallback if not available
      setLoading(false); // Set loading to false once data is ready
    } else {
      setLoading(false); // Ensure we stop loading even if no user is logged in
    }
  }, []);

  // Handle Login - redirect to Cognito login
  const handleLogin = () => {
    const loginUrl = buildSignInUrl();
    window.location.href = loginUrl;
  };

  // Handle Logout - clear local storage and redirect to home
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false); // Set logged-in state to false
    setUserRole(null);
    setUserName(""); // Reset name
    navigate("/"); // Redirect to home page
  };

  if (loading) {
    return <h1 style={{ fontSize: "28px", color: "#fff" }}>Loading...</h1>; // Show loading state if we're fetching user info
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Ensure full height for centering
        backgroundColor: "#1a1a1a", // Dark background for better contrast
        padding: "20px", // Padding for better spacing
      }}
    >
      <div
        style={{
          width: "80%",
          maxWidth: "1000px", // Max width for content
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#333", // Darker background for content container
          color: "#fff", // White text for readability
          borderRadius: "8px",
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {!isLoggedIn ? (
          <>
            <h1 style={{ fontSize: "48px", marginBottom: "30px" }}>
              Welcome to SmartQR Attendance
            </h1>
            <p style={{ fontSize: "24px", marginBottom: "50px" }}>
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
              {userRole === "Teachers" ? "Teacher Dashboard" : "Student Dashboard"}
            </h1>
            <p style={{ fontSize: "24px", marginBottom: "40px" }}>
              Welcome, <strong>{userName}</strong> (<span>{userRole}</span>)
            </p>

            {userRole === "Students" && (
              <div
                style={{
                  marginTop: "40px",
                  textAlign: "left",
                  fontSize: "22px",
                  maxWidth: "800px", // restrict width of list to look neat
                  margin: "0 auto",
                }}
              >
                <h2 style={{ fontSize: "28px", marginBottom: "25px" }}>Your Options:</h2>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  <li style={{ marginBottom: "15px" }}>
                    <Link to="/timetable" style={{ color: "#4CAF50" }}>
                      View your timetable
                    </Link>
                  </li>
                  <li style={{ marginBottom: "15px" }}><Link to="/scan-qr" style={{ color: "#4CAF50" }}>Scan QR to mark attendance</Link></li>
                  <li style={{ marginBottom: "15px" }}><Link to="/attendance-history" style={{ color: "#4CAF50" }}>View your attendance history</Link></li>
                  <li style={{ marginBottom: "15px" }}><Link to="#" style={{ color: "#4CAF50" }}>Check for any fraud alerts on your account</Link></li>
                </ul>
              </div>
            )}

            {userRole === "Teachers" && (
              <div
                style={{
                  marginTop: "40px",
                  textAlign: "left",
                  fontSize: "22px",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                <h2 style={{ fontSize: "28px", marginBottom: "25px" }}>Your Options:</h2>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  <li style={{ marginBottom: "15px" }}>
                    <Link to="/create-class" style={{ color: "#4CAF50" }}>
                      Create subjects + classes
                    </Link>
                  </li>
                  <li style={{ marginBottom: "15px" }}>
                    <Link to="/generate-qr" style={{ color: "#4CAF50" }}>
                      Generate attendance QR sessions
                    </Link>
                  </li>
                  <li style={{ marginBottom: "15px" }}>
                    <Link to="/attendance" style={{ color: "#4CAF50" }}>
                      View attendance reports
                    </Link>
                  </li>
                  <li style={{ marginBottom: "15px" }}>
                    <Link to="#" style={{ color: "#4CAF50" }}>
                      Check suspicious (fraud) attempts
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            <div style={{ marginTop: "50px" }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: "15px 35px",
                  fontSize: "22px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#e53935")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#f44336")}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
