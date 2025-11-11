import mongoose from "mongoose";

const SuspiciousAttemptSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  studentId: { 
    type: String, 
    required: true // Cognito sub ID 
  },
  ipAddress: String,
  userAgent: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SuspiciousAttempt", SuspiciousAttemptSchema);
