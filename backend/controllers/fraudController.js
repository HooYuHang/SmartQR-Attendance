import SuspiciousAttempt from "../models/SuspiciousAttempt.js";

export const getAllFrauds = async (req, res) => {
  const attempts = await SuspiciousAttempt.find()
    .populate("studentId", "name email")
    .populate("classId", "subject classDate");

  res.json(
    attempts.map(a => ({
      _id: a._id,
      studentName: a.studentId?.name,
      className: a.classId?.subject,
      usedIP: a.usedIP,
      attemptedAt: a.attemptedAt,
    }))
  );
};

export const getFraudsByStudent = async (req, res) => {
  const { studentId } = req.params;

  const attempts = await SuspiciousAttempt.find({ studentId })
    .populate("classId", "subject classDate");

  res.json(
    attempts.map(a => ({
      _id: a._id,
      className: a.classId?.subject,
      classDate: a.classId?.classDate,
      usedIP: a.usedIP,
      attemptedAt: a.attemptedAt,
    }))
  );
};
