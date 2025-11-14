// routes/ipRoutes.js or in your existing routes file
import express from "express";
const router = express.Router();

router.get("/get-my-ip", (req, res) => {
  // Get client IP (works behind proxies too)
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || // if behind proxy
    req.socket.remoteAddress ||                      // normal IP
    "Unknown";

  res.json({ ip });
});

export default router;
