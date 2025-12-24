// app.js
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
import fraudRoutes from "./routes/fraudRoutes.js";

dotenv.config();

const app = express();

// ⭐ REQUIRED for real IP behind Nginx
app.set("trust proxy", true);

// Simple CORS (same domain via Nginx)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/classes", classRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/students", studentRoutes);
app.use("/ip", ipRoutes);
app.use("/fraud", fraudRoutes);

// Test protected route
app.get("/student/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "SmartQR Attendance API running" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
