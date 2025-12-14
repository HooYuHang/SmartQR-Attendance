import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken, getUserInfo } from "../auth";
import api from "../api";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  const [expandedClasses, setExpandedClasses] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});

  // ⭐ Filter states
  const [filterMonth, setFilterMonth] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const navigate = useNavigate();
  const token = getAccessToken();
  const userInfo = getUserInfo();

  // ==============================
  // Fetch Classes + Students
  // ==============================
  const fetchData = async () => {
    try {
      const classesRes = await api.get(
        `/created-classes/${userInfo.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sortedClasses = classesRes.data.sort((a, b) => {
        const dtA = new Date(`${a.classDate}T${a.classTime}`);
        const dtB = new Date(`${b.classDate}T${b.classTime}`);
        return dtB - dtA;
      });

      setClasses(sortedClasses);
      setFilteredClasses(sortedClasses);

      const studentsRes = await api.get(
        "/students",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(studentsRes.data);

      const initialExpanded = {};
      sortedClasses.forEach(c => { initialExpanded[c._id] = true; });
      setExpandedClasses(initialExpanded);

      const initialStudentsExpanded = {};
      sortedClasses.forEach(c => { initialStudentsExpanded[c._id] = false; });
      setExpandedStudents(initialStudentsExpanded);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, [token, userInfo.sub]);

  // ==============================
  // Filter Logic
  // ==============================
  useEffect(() => {
    let filtered = [...classes];

    if (filterSubject !== "") {
      filtered = filtered.filter(cls => cls.subject === filterSubject);
    }

    if (filterMonth !== "") {
      const [year, month] = filterMonth.split("-");
      filtered = filtered.filter(cls => {
        const d = new Date(cls.classDate);
        return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
      });
    }

    if (filterWeek !== "") {
      filtered = filtered.filter(cls => {
        const d = new Date(cls.classDate);
        const weekNumber = Math.ceil((d.getDate() - 1) / 7) + 1;
        return weekNumber === Number(filterWeek);
      });
    }

    setFilteredClasses(filtered);
  }, [filterMonth, filterWeek, filterSubject, classes]);

  // ==============================
  // Existing Functions
  // ==============================
  const handleEnrollStudent = async (classId) => {
    if (!selectedStudent) return alert("Please select a student first");
    try {
      const response = await api.post(
        "/enroll-student",
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

  const handleRemoveStudent = async (classId, studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      const response = await api.post(
        "/remove-student",
        { classId, studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) fetchData();
      else alert(response.data.message || "Failed to remove student");
    } catch (err) {
      console.error(err);
      alert("Server error while removing student");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      const response = await api.delete(
        `/classes/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success)
        setClasses(prev => prev.filter(c => c._id !== classId));
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

      const res = await api.post(
        "/classes/toggle-hide",
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

  const toggleStudentList = (classId) => {
    setExpandedStudents(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  // ==============================
  // UI
  // ==============================
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

      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>My Classes 👨‍🏫</h1>

      {/* ⭐ FILTER BAR */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "25px",
        flexWrap: "wrap"
      }}>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Subjects</option>
          <option value="Cloud Engineering">Cloud Engineering</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Fintech">Fintech</option>
          <option value="General IT">General IT</option>
        </select>

        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={filterStyle}
        />

        <select
          value={filterWeek}
          onChange={(e) => setFilterWeek(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Weeks</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
          <option value="3">Week 3</option>
          <option value="4">Week 4</option>
          <option value="5">Week 5</option>
        </select>
      </div>

      {filteredClasses.length === 0 && <p>No classes found.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "800px" }}>
        {filteredClasses.map((cls) => {
          const isHidden = cls.hidden;
          const isExpanded = expandedClasses[cls._id];
          const studentsExpanded = expandedStudents[cls._id];

          return (
            <div key={cls._id} style={{ ...cardStyle, opacity: isHidden && !isExpanded ? 0.6 : 1 }}>
              {isExpanded && (
                <>
                  <h2 style={{ margin: "0 0 10px 0" }}>{cls.subject}</h2>
                  <p>
                    Classroom: {cls.classRoom} |  
                    Date: {new Date(cls.classDate).toLocaleDateString()} |  
                    Time: {new Date(`2000-01-01T${cls.classTime}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} |  
                    Duration: {cls.classDuration} minutes
                  </p>
                  <p>Enrolled Students: {cls.students.length}</p>

                  {/* BUTTONS */}
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
                        const response = await api.post(
                          "/enroll-all",
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

                  {/* Enrolled Student List */}
                  <div style={{ marginTop: "15px" }}>
                    <h4
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStudentList(cls._id)}
                    >
                      Enrolled Students ({cls.students.length})
                      <span style={{ marginLeft: "8px" }}>{studentsExpanded ? "▲" : "▼"}</span>
                    </h4>

                    {studentsExpanded && (
                      <ul style={{ marginTop: "10px" }}>
                        {cls.students.map(studentId => {
                          const student = students.find(s => s._id === studentId);
                          return (
                            <li key={studentId} style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "5px"
                            }}>
                              <span>{student ? `${student.name} (${student.email})` : studentId}</span>
                              <button onClick={() => handleRemoveStudent(cls._id, studentId)} style={removeButton}>Remove</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
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

/* Styles */
const backButtonStyle = { position: "absolute", top: "20px", right: "20px", padding: "10px 20px", fontSize: "14px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const filterStyle = { padding: "10px", borderRadius: "8px", backgroundColor: "#2c2c2c", border: "1px solid #555", color: "#fff" };
const cardStyle = { backgroundColor: "#2c2c2c", padding: "20px", borderRadius: "12px", boxShadow: "0 0 10px rgba(0,0,0,0.5)" };
const selectStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #555", backgroundColor: "#1c1c1c", color: "#fff", minWidth: "180px" };
const primaryButton = { padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" };
const greenButton = { ...primaryButton, backgroundColor: "#28a745" };
const deleteButton = { ...primaryButton, backgroundColor: "#dc3545" };
const toggleButton = { marginTop: "10px", padding: "6px 12px", borderRadius: "6px", border: "none", color: "#fff", cursor: "pointer" };
const removeButton = { padding: "4px 10px", borderRadius: "4px", border: "none", backgroundColor: "#f44336", color: "#fff", cursor: "pointer" };
