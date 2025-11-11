import express from "express";
import { createClass, listTeacherClasses } from "../controllers/classController.js";

const router = express.Router();

router.post("/create", createClass);
router.get("/my", listTeacherClasses);

export default router;
