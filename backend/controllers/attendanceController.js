import Attendance from "../models/Attendance.js";
import Session from "../models/Session.js";
import Class from "../models/Class.js";
import Enrollment from "../models/Enrollment.js";
import SuspiciousAttempt from "../models/SuspiciousAttempt.js";

export const markAttendance = async (req, res) => {
  try {
    const { sessionId, classId } = req.body;
    const studentId = req.user.sub;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Invalid QR" });

    const classData = await Class.findById(classId);

    // Check if student is enrolled
    const enrolled = await Enrollment.findOne({ classId, studentId });
    if (!enrolled) return res.status(403).json({ message: "Not enrolled in this class" });

    // IP validation
    const allowedSubnet = classData.allowedSubnet;
    const isValid = ipAddress.startsWith(allowedSubnet);

    if (!isValid) {
      await SuspiciousAttempt.create({
        sessionId,
        classId,
        studentId,
        ipAddress,
        userAgent,
        reason: "IP not within allowed subnet"
      });

      return res.status(401).json({ message: "Unauthorized Network (Fraud)", ipAddress });
    }

    // Normal attendance
    const attendance = await Attendance.create({
      sessionId,
      classId,
      studentId,
      ipAddress,
      status: "valid"
    });

    res.json({ message: "Attendance marked", attendance });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
