import mongoose from "mongoose";

const suspiciousSchema = new mongoose.Schema({
  sessionId: String,
  studentId: String,
  ipAddress: String,
  userAgent: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SuspiciousAttempt", suspiciousSchema);
