import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  studentId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  note: String
});

export default mongoose.model("Attendance", attendanceSchema);
