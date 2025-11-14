import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  classRoom: { type: String, required: true },
  classDate: { type: String, required: true },
  classTime: { type: String, required: true },
  classDuration: { type: Number, required: true }, // in minutes
  teacherId: { type: String, required: true }, // Cognito ID of teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // enrolled students
  hidden: { type: Boolean, default: false }, // <-- new field
  // 🔹 Add currentQR for storing generated QR codes
  currentQR: {
    data: { type: Object, default: null }, // stores QR data like { classId, ip, expiry }
    qrImage: { type: String, default: null }, // base64 image
    expiresAt: { type: Date, default: null }, // expiration timestamp
  },
});

export default mongoose.model("Class", classSchema);
