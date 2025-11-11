import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateClassPage() {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const navigate = useNavigate();

  const handleCreateClass = async () => {
    const response = await fetch("http://localhost:5000/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, className }),
    });
    const data = await response.json();
    if (data.success) {
      alert("Class created successfully");
      navigate("/"); // Redirect back to homepage or another page
    } else {
      alert("Failed to create class");
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
      <h2>Create New Class</h2>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Class Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleCreateClass} style={{ padding: "10px 20px" }}>
        Create Class
      </button>
      <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Back
      </button>
    </div>
  );
}
