// middleware/ipCheck.js
export const getClientIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "Unknown";

  // Normalize localhost IPv6 (::1) to IPv4
  if (ip === "::1") ip = "127.0.0.1";

  // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.15)
  if (ip.startsWith("::ffff:")) ip = ip.split(":").pop();

  return ip;
};
