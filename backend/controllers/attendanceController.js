import QRCode from "qrcode";
import Attendance from "../models/Attendance.js";

export async function generateQRCode(req, res) {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

  const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/scan/${encodeURIComponent(sessionId)}`;
  try {
    const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: "H" });
    return res.json({ qrDataUrl: dataUrl, url });
  } catch (err) {
    console.error("QR generation error:", err);
    return res.status(500).json({ message: "QR generation error" });
  }
}

export async function markAttendance(req, res) {
  const { sessionId, studentId } = req.body;
  if (!sessionId || !studentId) return res.status(400).json({ message: "Missing sessionId or studentId" });

  const ip = req.clientIp || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "";

  try {
    const exists = await Attendance.findOne({ sessionId, studentId }).exec();
    if (exists) return res.status(409).json({ message: "Attendance already recorded for this session" });

    const record = new Attendance({
      sessionId,
      studentId,
      ipAddress: ip.replace(/^::ffff:/, ""),
      userAgent,
    });
    await record.save();
    return res.json({ message: "Attendance recorded", record });
  } catch (err) {
    console.error("Failed save attendance:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
