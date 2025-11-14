// controllers/studentController.js

import mongoose from "mongoose";
import Class from "../models/Class.js";

export const getActiveQRForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Convert Cognito string ID into valid Mongo ObjectId if needed
    let mongoId;
    try {
      mongoId = new mongoose.Types.ObjectId(studentId);
    } catch {
      // If not a valid ObjectId, return empty
      return res.json({ success: true, qrCodes: [] });
    }

    // Find classes where this student is enrolled
    const classes = await Class.find({ students: mongoId });

    if (!classes.length) {
      return res.json({ success: true, qrCodes: [] });
    }

    const now = Date.now();
    const active = [];

    for (let cls of classes) {
      if (!cls.currentQR) continue;

      const expiresAt =
        cls.currentQR.expiresAt ||
        cls.currentQR.expiry ||
        (cls.currentQR.data?.expiry ?? null);

      const qrData =
        cls.currentQR.data || {
          classId: cls._id,
          expiry: expiresAt,
          ip: cls.currentQR.ip || null,
        };

      if (!expiresAt) continue;
      if (now > expiresAt) continue;

      active.push({
        classId: cls._id,
        qrImage: cls.currentQR.qrImage,
        qrData,
        expiry: expiresAt,
      });
    }

    return res.json({ success: true, qrCodes: active });

  } catch (error) {
    console.error("Error getting active QR:", error);
    res.status(500).json({ success: false, message: "Error fetching QR data" });
  }
};


// controllers/studentController.js
export const getStudentIP = (req, res) => {
  const { getClientIP } = require("../middleware/ipCheck.js");
  const ip = getClientIP(req);
  res.json({ ip });
};