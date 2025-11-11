import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// **Ensure dotenv loads first**
dotenv.config();

console.log("COGNITO_REGION:", process.env.COGNITO_REGION);
console.log("COGNITO_USER_POOL_ID:", process.env.COGNITO_USER_POOL_ID);

import classRoutes from "./routes/classRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (needed for correct IP when deployed)
app.set("trust proxy", true);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- REMOVE temporary auth for testing /student/me ---
/* 
app.use((req, res, next) => {
  req.user = { 
    sub: "dummy-cognito-id-123",
    role: "teacher"
  };
  next();
});
*/

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/class", classRoutes);
app.use("/session", sessionRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/student", studentRoutes);
app.use("/auth", authRoutes);

// **Protect /student/me route with Cognito auth**
app.get("/student/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Test route
app.get("/", (req, res) => res.json({ message: "SmartQR Attendance API" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
