// routes/classRoutes.js
import mongoose from "mongoose";
import express from "express";
import {
  createClass,
  enrollStudent,
  getCreatedClasses,
  getAllStudents,
  getAvailableClasses,
  deleteClass,
  getStudentTimetable,
  enrollAllStudents,
  removeStudent,
  toggleHideClass,
  generateQRCodeForClass,
  getLatestQRCode,
} from "../controllers/classController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { markAttendance } from "../controllers/attendanceController.js"; // <- import here
import Attendance from "../models/Attendance.js"; // your attendance model
import User from "../models/User.js";
import Class from "../models/Class.js";

const router = express.Router();

// Create a class
router.post("/classes", verifyToken, createClass);

// Enroll a student manually
router.post("/enroll-student", verifyToken, enrollStudent);

// Get all classes by teacher
router.get("/created-classes/:teacherId", verifyToken, getCreatedClasses);

// Get all students
router.get("/students", verifyToken, getAllStudents);

// Get available subjects and class rooms
router.get("/available-classes", verifyToken, getAvailableClasses);

// Delete class
router.delete("/classes/:classId", verifyToken, deleteClass);

// Get student timetable by Cognito ID
router.get("/student/timetable/:cognitoId", verifyToken, getStudentTimetable);

// Enroll all students in a class
router.post("/enroll-all", verifyToken, enrollAllStudents);

// Remove a student from a class
router.post("/remove-student", verifyToken, removeStudent);

// Toggle hidden/show class
router.post("/classes/toggle-hide", verifyToken, toggleHideClass);

// Teacher generates QR code for a class
router.post("/classes/:classId/generate-qr", verifyToken, generateQRCodeForClass);

// Student fetches latest QR for class
router.get("/classes/:classId/latest-qr", verifyToken, getLatestQRCode);

// ---- ADDED: mark attendance route that matches frontend ----
router.post("/classes/:classId/mark-attendance", verifyToken, markAttendance);


router.get("/classes/:classId/attendance", verifyToken, async (req, res) => {
  try {
    let { classId } = req.params;
    classId = classId.trim(); // remove any whitespace

    // Remove strict ObjectId check for now
    // if (!mongoose.Types.ObjectId.isValid(classId))
    //   return res.status(400).json({ success: false, message: "Invalid class ID" });

    // Fetch attendance
    const attendanceRecords = await Attendance.find({ classId }).lean(); // treat classId as string

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.json({ success: true, attendance: [] });
    }

    const studentIds = attendanceRecords.map(a => a.studentId).filter(Boolean).map(id => id.toString());
    const students = await User.find({ _id: { $in: studentIds } }).lean();

    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = { name: s.name, email: s.email };
    });

    const enriched = attendanceRecords.map(a => ({
      ...a,
      studentName: studentMap[a.studentId?.toString()]?.name || "Unknown",
      studentEmail: studentMap[a.studentId?.toString()]?.email || "Unknown",
    }));

    res.json({ success: true, attendance: enriched });
  } catch (err) {
    console.error("Error fetching class attendance:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/classes/:classId", verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    res.json(cls);
  } catch (err) {
    console.error("Error fetching class info:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
