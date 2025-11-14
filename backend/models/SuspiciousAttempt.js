import mongoose from "mongoose";

const suspiciousAttemptSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attemptedAt: { type: Date, default: Date.now },
  usedIP: { type: String, required: true },
});

export default mongoose.model("SuspiciousAttempt", suspiciousAttemptSchema);
