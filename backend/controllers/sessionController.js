import Session from "../models/Session.js";
import Class from "../models/Class.js";
import QRCode from "qrcode";

export const createSession = async (req, res) => {
  try {
    const { classId } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ message: "Class not found" });

    const session = await Session.create({
      classId,
      teacherId: req.user.sub
    });

    const payload = {
      sessionId: session._id,
      classId: classId,
      timestamp: Date.now()
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload));

    res.json({ qrDataUrl, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
