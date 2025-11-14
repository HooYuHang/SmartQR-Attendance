import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthCallback from "./pages/AuthCallback";
import CreateClassPage from "./pages/CreateClassPage";
import StudentTimetablePage from "./pages/StudentTimetablePage"; // Import your pages
import GenerateQRCodePage from "./pages/GenerateQRCodePage";
import AttendancePage from "./pages/AttendancePage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage"; // New Page
import ScanQRCodePage from "./pages/ScanQRCodePage"; // Added 
import StudentDashboard from "./pages/StudentDashboard"; 
import TeacherDashboard from "./pages/TeacherDashboard"; 
import FraudAlertPage from "./pages/FraudAlertPage"; // Import FraudAlertPage
import StudentFraudAlertPage from "./pages/StudentFraudAlertPage"; // Import StudentFraudAlertPage
import TeacherClassesPage from "./pages/TeacherClassesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/teacher/dashboard/create-class" element={<CreateClassPage />} />
        <Route path="/teacher/dashboard/classes" element={<TeacherClassesPage />} />
        <Route path="/student/dashboard/timetable" element={<StudentTimetablePage />} />
        <Route path="/teacher/dashboard/generate-qr" element={<GenerateQRCodePage />} />
        <Route path="/attendance/:classId" element={<AttendancePage />} />
        <Route path="/student/dashboard/attendance-history" element={<AttendanceHistoryPage />} />
        <Route path="/student/dashboard/scan-qr" element={<ScanQRCodePage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/dashboard/fraud-alerts" element={<FraudAlertPage />} /> 
        <Route path="/student/dashboard/fraud-alerts" element={<StudentFraudAlertPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
