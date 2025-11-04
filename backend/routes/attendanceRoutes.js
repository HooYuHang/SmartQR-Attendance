import express from "express";
import { generateQRCode, markAttendance } from "../controllers/attendanceController.js";
import { ipCheck } from "../middleware/ipCheck.js";

const router = express.Router();

router.get("/generate/:sessionId", generateQRCode);
router.post("/mark", ipCheck, markAttendance);

export default router;
