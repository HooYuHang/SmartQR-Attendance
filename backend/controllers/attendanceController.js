// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import SuspiciousAttempt from "../models/SuspiciousAttempt.js";
import { getClientIP } from "../middleware/ipCheck.js";
import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  try {
    const cognitoId = req.user?.id;
    if (!cognitoId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const student = await User.findOne({
      cognito_id: cognitoId,
      role: "Students",
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const { classId } = req.params;
    const cls = await Class.findById(classId);

    if (!cls) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    if (!cls.students.includes(student._id)) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const existing = await Attendance.findOne({
      classId,
      studentId: student._id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already marked" });
    }

    const qr = cls.currentQR;
    if (!qr || !qr.expiresAt || !qr.data?.ip) {
      return res.status(400).json({ success: false, message: "QR invalid" });
    }

    const now = Date.now();
    const studentIP = getClientIP(req);
    const teacherIP = qr.data.ip;

    if (now > new Date(qr.expiresAt)) {
      await Attendance.create({
        classId,
        studentId: student._id,
        status: "absent",
        timestamp: now,
        isFraud: false,
        ipAddress: studentIP,
      });

      return res.status(400).json({
        success: false,
        message: "QR expired",
      });
    }

    const isFraud = studentIP !== teacherIP;

    if (isFraud) {
      await SuspiciousAttempt.create({
        classId,
        studentId: student._id,
        usedIP: studentIP,
        attemptedAt: now,
      });
    }

    await Attendance.create({
      classId,
      studentId: student._id,
      status: "present",
      timestamp: now,
      isFraud,
      ipAddress: studentIP,
    });

    res.json({ success: true, isFraud });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ success: false });
  }
};


// Fetch attendance for a class
export const getAttendanceByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const records = await Attendance.find({ classId }).lean();
    records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(records.map(r => ({
      _id: r._id,
      studentId: r.studentId,
      status: r.status,
      isFraud: r.isFraud,
      timestamp: r.timestamp,
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

