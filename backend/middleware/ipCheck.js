import SuspiciousAttempt from "../models/SuspiciousAttempt.js";

export async function ipCheck(req, res, next) {
  // get real IP even behind proxies
  let ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "";
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  ip = ip.replace(/^::ffff:/, "");

  req.clientIp = ip;

  const allowed = (process.env.ALLOWED_SUBNETS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    return next(); // no restriction configured => allow
  }

  const matches = allowed.some(prefix => ip.startsWith(prefix));
  if (!matches) {
    console.log(`⚠️ Unauthorized IP attempt: ${ip}`);
    try {
      const attempt = new SuspiciousAttempt({
        sessionId: req.body.sessionId || "unknown",
        studentId: req.body.studentId || "unknown",
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || "unknown",
        reason: "IP not in allowed subnet",
      });
      await attempt.save();
    } catch (err) {
      console.error("Failed log suspicious attempt:", err.message);
    }
    return res.status(403).json({ message: "Unauthorized network (IP not allowed)", ip });
  }

  next();
}
