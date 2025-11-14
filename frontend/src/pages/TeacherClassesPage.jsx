import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, getUserInfo } from "../auth";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [expandedClasses, setExpandedClasses] = useState({});
  const navigate = useNavigate();
  const token = getAccessToken();
  const userInfo = getUserInfo();

  const fetchData = async () => {
    try {
      const classesRes = await axios.get(
        `http://localhost:5000/api/created-classes/${userInfo.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sortedClasses = classesRes.data.sort((a, b) => {
        const dtA = new Date(`${a.classDate}T${a.classTime}`);
        const dtB = new Date(`${b.classDate}T${b.classTime}`);
        return dtB - dtA;
      });
      setClasses(sortedClasses);

      const studentsRes = await axios.get("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(studentsRes.data);

      const initialExpanded = {};
      sortedClasses.forEach(c => { initialExpanded[c._id] = true; });
      setExpandedClasses(initialExpanded);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, [token, userInfo.sub]);

  const handleEnrollStudent = async (classId) => {
    if (!selectedStudent) return alert("Please select a student first");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/enroll-student",
        { classId, studentId: selectedStudent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) fetchData();
      else alert(response.data.message || "Enrollment failed");
    } catch (err) {
      console.error(err);
      alert("Server error during enrollment");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/classes/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setClasses(prev => prev.filter(c => c._id !== classId));
      else alert(response.data.message || "Failed to delete class");
    } catch (err) {
      console.error(err);
      alert("Server error while deleting class");
    }
  };

  const toggleHideClass = async (classId, show = false) => {
    try {
      const cls = classes.find(c => c._id === classId);
      const desiredHidden = show ? false : !cls.hidden;

      const res = await axios.post(
        "http://localhost:5000/api/classes/toggle-hide",
        { classId, hidden: desiredHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setClasses(prev =>
          prev.map(c => (c._id === classId ? { ...c, hidden: res.data.hidden } : c))
        );
        setExpandedClasses(prev => ({ ...prev, [classId]: !res.data.hidden }));
      }
    } catch (err) {
      console.error("Error toggling hide:", err);
      alert("Server error while toggling class visibility");
    }
  };

  return (
    <div style={{
      backgroundColor: "#1c1c1c",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
    }}>
      <button
        onClick={() => navigate("/teacher/dashboard")}
        style={backButtonStyle}
      >
        Back to Dashboard
      </button>

      <h1 style={{ fontSize: "2rem", marginBottom: "30px" }}>My Classes 👨‍🏫</h1>
      {classes.length === 0 && <p>No classes created yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "800px" }}>
        {classes.map((cls) => {
          const isHidden = cls.hidden;
          const isExpanded = expandedClasses[cls._id];

          return (
            <div key={cls._id} style={{ ...cardStyle, opacity: isHidden && !isExpanded ? 0.6 : 1 }}>
              {isExpanded && (
                <>
                  <h2 style={{ margin: "0 0 10px 0" }}>{cls.subject}</h2>
                  <p>
                    Classroom: {cls.classRoom} | Date: {new Date(cls.classDate).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} | Time: {new Date(`2000-01-01T${cls.classTime}`).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} | Duration: {cls.classDuration} minutes
                  </p>
                  <p>Enrolled Students: {cls.students.length}</p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select Student</option>
                      {students.map(stu => (
                        <option key={stu._id} value={stu._id}>{stu.name} ({stu.email})</option>
                      ))}
                    </select>

                    <button onClick={() => handleEnrollStudent(cls._id)} style={primaryButton}>Enroll Student</button>

                    <button onClick={async () => {
                      try {
                        const response = await axios.post(
                          "http://localhost:5000/api/enroll-all",
                          { classId: cls._id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (response.data.success) {
                          alert(`Enrolled ${response.data.enrolledCount} students`);
                          fetchData();
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Error enrolling all students");
                      }
                    }} style={greenButton}>Enroll All Students</button>

                    <button onClick={() => navigate(`/attendance/${cls._id}`)} style={primaryButton}>View Attendance</button>

                    <button onClick={() => handleDeleteClass(cls._id)} style={deleteButton}>Delete Class</button>
                  </div>
                </>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); toggleHideClass(cls._id, cls.hidden); }}
                style={{ ...toggleButton, backgroundColor: cls.hidden ? "#28a745" : "#888" }}
              >
                {cls.hidden ? (isExpanded ? "Hide" : "Show") : "Hide"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const backButtonStyle = {
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
};

const cardStyle = {
  backgroundColor: "#2c2c2c",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
};

const selectStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#1c1c1c",
  color: "#fff",
  minWidth: "180px",
};

const primaryButton = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

const greenButton = {
  ...primaryButton,
  backgroundColor: "#28a745",
};

const deleteButton = {
  ...primaryButton,
  backgroundColor: "#dc3545",
};

const toggleButton = {
  marginTop: "10px",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};
