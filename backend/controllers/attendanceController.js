// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import SuspiciousAttempt from "../models/SuspiciousAttempt.js";
import { getClientIP } from "../middleware/ipCheck.js";
import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  try {
    const cognitoId = req.user?.id; // fixed: use req.user from verifyToken
    if (!cognitoId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const student = await User.findOne({ cognito_id: cognitoId, role: "Students" });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const studentId = student._id;
    const { classId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    if (!cls.students.includes(studentId)) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this class" });
    }

    const existing = await Attendance.findOne({ classId, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Attendance already marked" });
    }

    const currentQR = cls.currentQR;
    if (!currentQR || !currentQR.expiresAt || !currentQR.data) {
      return res.status(400).json({ success: false, message: "No QR code available" });
    }

    const now = Date.now();

    if (now > new Date(currentQR.expiresAt)) {
      await Attendance.create({
        classId,
        studentId,
        status: "absent",
        timestamp: now,
        isFraud: false,
      });
      return res.status(400).json({ success: false, message: "QR expired, attendance marked as absent" });
    }

    let studentIP = getClientIP(req);
    if (studentIP === "::1") studentIP = "127.0.0.1";
    let teacherIP = currentQR.data.ip || "127.0.0.1";
    if (teacherIP === "::1") teacherIP = "127.0.0.1";

    if (teacherIP === "127.0.0.1") {
      // localhost bypass
      await Attendance.create({
        classId,
        studentId,
        status: "present",
        timestamp: now,
        isFraud: false,
      });
      return res.json({ success: true, status: "present", isFraud: false });
    }

    const isFraud = studentIP !== teacherIP;

    if (isFraud) {
      await SuspiciousAttempt.create({
        classId,
        studentId,
        attemptedAt: now,
        usedIP: studentIP,
      });
    }

    await Attendance.create({
      classId,
      studentId,
      status: isFraud ? "absent" : "present",
      timestamp: now,
      isFraud,
    });

    res.json({ success: true, status: isFraud ? "absent" : "present", isFraud });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ success: false, message: "Failed to mark attendance" });
  }
};

// Fetch attendance for a class
export const getAttendanceByClassId = async (classId) => {
  // Find all attendance records for this class
  const records = await Attendance.find({ classId }).lean();

  // Optional: sort by timestamp ascending
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return records.map(r => ({
    _id: r._id,
    studentId: r.studentId,
    status: r.status,
    isFraud: r.isFraud,
    timestamp: r.timestamp,
  }));
};
