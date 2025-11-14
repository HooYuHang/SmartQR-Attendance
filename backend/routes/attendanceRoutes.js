// backend/routes/attendanceRoutes.js
import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect the route with verifyToken (authMiddleware attaches req.user)
router.post("/:classId/mark-attendance", verifyToken, markAttendance);

export default router;
