export const getClientIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "Unknown";

  // Normalize localhost
  if (ip === "::1") ip = "127.0.0.1";

  // Convert IPv6-mapped IPv4 (::ffff:192.168.1.10)
  if (ip.startsWith("::ffff:")) {
    ip = ip.split(":").pop();
  }

  return ip;
};
