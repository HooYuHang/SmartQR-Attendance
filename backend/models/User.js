import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
