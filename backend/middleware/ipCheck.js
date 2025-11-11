import SuspiciousAttempt from "../models/SuspiciousAttempt.js";

/**
 * IP Check Middleware
 * - Ensures requests come from allowed subnets (if configured)
 * - Logs suspicious attempts in MongoDB
 * - Requires JWT to have run first (so req.user exists)
 */
export async function ipCheck(req, res, next) {
  try {
    // Get real IP even behind proxies
    let ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "";
    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    ip = ip.replace(/^::ffff:/, ""); // IPv4-mapped IPv6

    req.clientIp = ip; // attach for later use

    // Load allowed subnets from environment
    const allowed = (process.env.ALLOWED_SUBNETS || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    // If no restriction configured, allow all
    if (allowed.length === 0) return next();

    // Check if IP starts with any allowed prefix
    const matches = allowed.some(prefix => ip.startsWith(prefix));

    if (!matches) {
      console.warn(`⚠️ Unauthorized IP attempt: ${ip} | User: ${req.user?.sub || "unknown"}`);

      // Log attempt in MongoDB
      try {
        const attempt = new SuspiciousAttempt({
          sessionId: req.body.sessionId || "unknown",
          studentId: req.body.studentId || req.user?.sub || "unknown",
          ipAddress: ip,
          userAgent: req.headers["user-agent"] || "unknown",
          reason: "IP not in allowed subnet",
        });
        await attempt.save();
      } catch (err) {
        console.error("Failed to log suspicious attempt:", err.message);
      }

      return res.status(403).json({ message: "Unauthorized network (IP not allowed)", ip });
    }

    // IP is allowed
    next();
  } catch (err) {
    console.error("IP check error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
