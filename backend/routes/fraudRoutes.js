// routes/fraudRoutes.js
import express from "express";
import {
  getAllFrauds,
  getFraudsByStudent
} from "../controllers/fraudController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teacher + Admin can see all frauds
router.get("/fraud/all", verifyToken, getAllFrauds);

// Student can see own frauds
router.get("/fraud/student/:studentId", verifyToken, getFraudsByStudent);

export default router;
