import express from "express";
import Class from "../models/Class.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getActiveQRForStudent, getStudentIP } from "../controllers/studentController.js";

const router = express.Router();

// Get enrolled classes for student
router.get("/enrolled-classes/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const classes = await Class.find({ students: studentId });

    return res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching enrolled classes:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Student fetches active QR codes
router.get("/:studentId/active-qr", verifyToken, getActiveQRForStudent);

router.get("/ip", verifyToken, getStudentIP);


export default router;
