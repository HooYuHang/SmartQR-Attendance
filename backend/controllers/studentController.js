import Enrollment from "../models/Enrollment.js";
import Class from "../models/Class.js";

export const getTimetable = async (req, res) => {
  try {
    const studentId = req.user.sub;

    const enrollments = await Enrollment.find({ studentId });

    const classList = await Class.find({
      _id: { $in: enrollments.map(e => e.classId) }
    });

    res.json(classList);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
