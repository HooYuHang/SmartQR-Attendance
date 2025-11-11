import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /auth/save-user - Save or update the user role
router.post("/save-user", async (req, res) => {
  const { cognito_id, email, name, role } = req.body;
  try {
    // Find the user by cognito_id (unique to each user) or create/update user if doesn't exist
    const user = await User.findOneAndUpdate(
      { cognito_id },
      { email, name, role },
      { new: true, upsert: true } // If no user found, create a new one
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to save user", message: err.message });
  }
});

// GET /auth/user-role - Fetch the user's role from the database
router.get("/user-role", async (req, res) => {
  const { cognito_id } = req.query;
  try {
    const user = await User.findOne({ cognito_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user role", message: err.message });
  }
});

export default router;
