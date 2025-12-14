import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import classRoutes from "./routes/classRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import ipRoutes from "./routes/ipRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Trust proxy (CloudFront / EB)
app.set("trust proxy", true);

// CORS
app.use(
  cors({
    origin: [
      "https://smartqr-attendance.online",
      "https://www.smartqr-attendance.online",
      "http://localhost:5173"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// Routes
// -------------------------
app.use("/auth", authRoutes);
app.use("/", classRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/students", studentRoutes);
app.use("/ip", ipRoutes);

// Protected test
app.get("/student/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Health check (VERY IMPORTANT FOR EB)
app.get("/", (req, res) => {
  res.json({ message: "SmartQR Attendance API" });
});

// -------------------------
// START SERVER FIRST
// -------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// -------------------------
// CONNECT TO MONGO AFTER
// -------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));
