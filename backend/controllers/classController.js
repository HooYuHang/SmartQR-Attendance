import Class from "../models/Class.js";

export const createClass = async (req, res) => {
  try {
    const { subject, section, schedule, allowedSubnet } = req.body;

    const newClass = await Class.create({
      teacherId: req.user.sub, // Cognito ID after integration
      subject,
      section,
      schedule,
      allowedSubnet
    });

    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.sub });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
