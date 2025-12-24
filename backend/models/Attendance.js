import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
  timestamp: { type: Date, default: Date.now },
  isFraud: { type: Boolean, default: false },

  ipAddress: { type: String, required: true },

});

export default mongoose.model("Attendance", attendanceSchema);
