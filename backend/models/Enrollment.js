import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  studentId: String, // Cognito ID
});

export default mongoose.model("Enrollment", EnrollmentSchema);
