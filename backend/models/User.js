// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  cognito_id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "Students" },  // Default to 'Students' if role is not set
});

export default mongoose.model("User", userSchema);
