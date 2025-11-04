import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for cloud deployment behind proxies)
app.set("trust proxy", true);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/attendance", attendanceRoutes);

// simple test route
app.get("/", (req, res) => res.json({ message: "SmartQR Attendance API" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
