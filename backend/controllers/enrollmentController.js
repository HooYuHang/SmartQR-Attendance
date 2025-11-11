import Enrollment from "../models/Enrollment.js";

export const enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    const exists = await Enrollment.findOne({ classId, studentId });
    if (exists) return res.status(400).json({ message: "Student already enrolled" });

    const newEnroll = await Enrollment.create({ classId, studentId });

    res.status(201).json(newEnroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Enrollment.find({ classId });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
