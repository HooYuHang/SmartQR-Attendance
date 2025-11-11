import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ScanPage from "./pages/ScanPage";
import AuthCallback from "./pages/AuthCallback";
import CreateClassPage from "./pages/CreateClassPage";
import StudentTimetablePage from "./pages/StudentTimetablePage"; // Import your pages
import GenerateQRCodePage from "./pages/GenerateQRCodePage";
import AttendancePage from "./pages/AttendancePage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage"; // New Page
import ScanQRCodePage from "./pages/ScanQRCodePage"; // Added ScanQRCodePage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan/:sessionId" element={<ScanPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/create-class" element={<CreateClassPage />} />
        <Route path="/timetable" element={<StudentTimetablePage />} />
        <Route path="/generate-qr" element={<GenerateQRCodePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance-history" element={<AttendanceHistoryPage />} />
        <Route path="/scan-qr" element={<ScanQRCodePage />} />
      </Routes>
    </Router>
  );
}

export default App;
