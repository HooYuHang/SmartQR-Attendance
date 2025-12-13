import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import classRoutes from "./routes/classRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import ipRoutes from "./routes/ipRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();

// Trust proxy (important for IP detection behind Lambda/API Gateway)
app.set("trust proxy", true);

// Middleware
app.use(
  cors({
    origin: [
      "https://smartqr-attendance.online",
      "https://www.smartqr-attendance.online",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB (Lambda-safe)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));
}

// -------------------------
// Routes (clean, no /api prefix)
// -------------------------

// Auth routes
app.use("/auth", authRoutes);

// Class routes
app.use("/classes", classRoutes);

// Attendance routes
app.use("/classes", attendanceRoutes);

// Student routes
app.use("/students", studentRoutes);

// IP routes
app.use("/", ipRoutes); // assuming IP routes are like /ip or /get-my-ip

// Protected test route
app.get("/student/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Test root route
app.get("/", (req, res) => {
  res.json({ message: "SmartQR Attendance API" });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
