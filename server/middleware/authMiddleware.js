const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload: { userId, email }

    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authRequired };
