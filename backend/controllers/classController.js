import QRCode from "qrcode";
import Class from "../models/Class.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { getClientIP } from "../middleware/ipCheck.js"; // utility to get teacher IP


// Helper to check time overlap
const isOverlap = (start1, duration1, start2, duration2) => {
  const end1 = new Date(start1.getTime() + duration1 * 60000); // duration in ms
  const end2 = new Date(start2.getTime() + duration2 * 60000);
  return start1 < end2 && start2 < end1; // overlap if times intersect
};

// Create a class (with optional batch for multiple weeks)
export const createClass = async (req, res) => {
  try {
    const { subject, classRoom, classDate, classTime, classDuration, weeks } = req.body;

    if (!subject || !classRoom || !classDate || !classTime || !classDuration) {
      return res.json({ success: false, message: "All fields including duration are required" });
    }

    const teacherId = req.user.id;
    const startDate = new Date(`${classDate}T${classTime}`);
    const totalWeeks = weeks && weeks > 1 ? weeks : 1;

    const createdClasses = [];
    const conflicts = [];

    for (let i = 0; i < totalWeeks; i++) {
      const classDateObj = new Date(startDate);
      classDateObj.setDate(startDate.getDate() + i * 7); // add 7 days per week

      const classDateStr = classDateObj.toISOString().split("T")[0];
      const startTime = new Date(`${classDateStr}T${classTime}`);

      // Fetch classes on this date
      const classesOnDate = await Class.find({ classDate: classDateStr });

      // Check classroom conflict
      const roomConflict = classesOnDate.find(c =>
        c.classRoom === classRoom && isOverlap(startTime, classDuration, new Date(`${c.classDate}T${c.classTime}`), c.classDuration)
      );

      // Check teacher conflict
      const teacherConflict = classesOnDate.find(c =>
        c.teacherId === teacherId && isOverlap(startTime, classDuration, new Date(`${c.classDate}T${c.classTime}`), c.classDuration)
      );

      if (roomConflict || teacherConflict) {
        conflicts.push({
          week: i + 1,
          classDate: classDateStr,
          message: roomConflict
            ? `Classroom ${classRoom} is occupied`
            : `You have another class at this time`,
        });
        continue; // skip creating this week
      }

      // Create class
      const newClass = new Class({
        subject,
        classRoom,
        classDate: classDateStr,
        classTime,
        classDuration,
        teacherId,
      });
      await newClass.save();
      createdClasses.push(newClass);
    }

    res.json({
      success: true,
      createdClasses,
      conflicts,
      message: conflicts.length
        ? "Some classes could not be created due to conflicts"
        : "All classes created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Enroll student manually
export const enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    // Already enrolled check
    if (classDoc.students.includes(studentId)) {
      return res.json({ success: false, message: "Student already enrolled" });
    }

    // Parse class start/end
    const classStart = new Date(`${classDoc.classDate}T${classDoc.classTime}`);
    const classEnd = new Date(classStart.getTime() + (classDoc.classDuration || 60) * 60000);

    // Check conflicts properly
    const studentClasses = await Class.find({ students: studentId, classDate: classDoc.classDate });

    const conflict = studentClasses.some((c) => {
      const cStart = new Date(`${c.classDate}T${c.classTime}`);
      const cEnd = new Date(cStart.getTime() + (c.classDuration || 60) * 60000);
      return classStart < cEnd && cStart < classEnd; // overlap
    });

    if (conflict) {
      return res.json({ success: false, message: "Student is already enrolled in another class at this time." });
    }

    // All good, enroll student
    classDoc.students.push(studentId);
    await classDoc.save();

    res.json({ success: true, class: classDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get all classes created by a teacher
export const getCreatedClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const classes = await Class.find({ teacherId })
      .lean()
      .sort({ classDate: -1, classTime: -1 }); // latest first
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get all students (for manual enrollment)
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "Students" });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get available subjects and class rooms
export const getAvailableClasses = (req, res) => {
  try {
    const subjects = ["Cloud Engineering","Cybersecurity","FinTech","General IT"];
    const classRooms = ["101", "102", "103", "104"];
    res.json({ subjects, classRooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    // Only the teacher who created the class can delete it
    if (classDoc.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this class." });
    }

    await Class.findByIdAndDelete(classId);
    res.json({ success: true, message: "Class deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get timetable for a student by Cognito ID
export const getStudentTimetable = async (req, res) => {
  try {
    const { cognitoId } = req.params;
    if (!cognitoId) return res.status(400).json({ success: false, message: "Missing cognitoId" });

    // Find Mongo _id for this Cognito ID (student)
    const student = await User.findOne({ cognito_id: cognitoId, role: "Students" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    // Find classes where this student's ObjectId is in the students array
    let classes = await Class.find({ students: student._id }).lean();
    if (!classes || classes.length === 0) {
      return res.json({ success: true, timetable: [] });
    }

    // Collect unique teacherIds
    const teacherIds = [...new Set(classes.map((c) => c.teacherId).filter(Boolean))];
    const teachers = await User.find({ cognito_id: { $in: teacherIds } }).lean();

    const teacherMap = {};
    teachers.forEach((t) => {
      teacherMap[t.cognito_id] = t.name || t.email || "Unknown Teacher";
    });

    // Fetch all attendance records for this student
    const attendanceRecords = await Attendance.find({ studentId: student._id }).lean();

    // Map classes with teacherName and attendanceStatus
    const enriched = classes
      .map((c) => {
        const attendance = attendanceRecords.find(
          (a) => a.classId.toString() === c._id.toString()
        );

        return {
          ...c,
          teacherName: teacherMap[c.teacherId] || "Unknown",
          attendanceStatus: attendance
            ? attendance.isFraud
              ? "fraud"
              : attendance.status
            : "absent",
          _dateTimeObj: new Date(`${c.classDate}T${c.classTime}`),
        };
      })
      .sort((a, b) => a._dateTimeObj - b._dateTimeObj)
      .map(({ _dateTimeObj, ...rest }) => rest); // remove temp field

    return res.json({ success: true, timetable: enriched });
  } catch (err) {
    console.error("Error in getStudentTimetable:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Enroll all students
export const enrollAllStudents = async (req, res) => {
  try {
    const { classId } = req.body;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    const allStudents = await User.find({ role: "Students" });
    let enrolledCount = 0;

    for (let stu of allStudents) {
      if (classDoc.students.includes(stu._id)) continue;

      // Conflict check
      const studentClasses = await Class.find({ students: stu._id, classDate: classDoc.classDate });
      const classStart = new Date(`${classDoc.classDate}T${classDoc.classTime}`);
      const classEnd = new Date(classStart.getTime() + (classDoc.classDuration || 60) * 60000);

      const conflict = studentClasses.some((c) => {
        const cStart = new Date(`${c.classDate}T${c.classTime}`);
        const cEnd = new Date(cStart.getTime() + (c.classDuration || 60) * 60000);
        return classStart < cEnd && cStart < classEnd;
      });

      if (!conflict) {
        classDoc.students.push(stu._id);
        enrolledCount++;
      }
    }

    await classDoc.save();
    res.json({ success: true, enrolledCount, class: classDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove a student from a class
export const removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    classDoc.students = classDoc.students.filter((s) => s.toString() !== studentId);
    await classDoc.save();

    res.json({ success: true, class: classDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle hidden/show class
export const toggleHideClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    // Only the teacher who created the class can toggle
    if (classDoc.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    classDoc.hidden = !classDoc.hidden;
    await classDoc.save();

    res.json({ success: true, hidden: classDoc.hidden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getClassAttendance = async (req, res) => {
  const { classId } = req.params;
  const cls = await Class.findById(classId).populate('students', 'name email');
  const attendance = await Attendance.find({ class: classId }).populate('student', 'name email');
  res.json({ class: cls, attendance });
};

export const getLatestQRCode = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    if (!cls.currentQR) {
      return res.status(404).json({ success: false, message: "No QR code generated yet" });
    }

    const now = Date.now();
    if (now > cls.currentQR.expiresAt) {
      return res.status(400).json({ success: false, message: "QR code expired" });
    }

    res.json({
      success: true,
      qrImage: cls.currentQR.qrImage || null,
      qrData: cls.currentQR.data,
      qrIP: cls.currentQR.data.ip || "Unknown", // <-- send teacher IP here
      expiry: cls.currentQR.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch latest QR code" });
  }
};


export const generateQRCodeForClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });

    const now = Date.now();
    const expiresAt = now + 3 * 60 * 1000; // 3 minutes

    const teacherIP = getClientIP(req); // <--- detect actual teacher IP

    const qrData = {
      classId: cls._id,
      ip: teacherIP, // replace with actual IP if needed
      expiry: expiresAt,
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

    // Save to MongoDB
    cls.currentQR = {
      data: qrData,
      qrImage,
      expiresAt,
    };

    await cls.save();

    res.json({ success: true, qrImage, expiry: expiresAt });
  } catch (err) {
    console.error("Error generating QR code:", err);
    res.status(500).json({ success: false, message: "Failed to generate QR code" });
  }
};