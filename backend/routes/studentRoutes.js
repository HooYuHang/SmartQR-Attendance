import express from "express";
import { getTimetable } from "../controllers/studentController.js";

const router = express.Router();

router.get("/timetable", getTimetable);

export default router;
