const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, username: user.userName },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, avatar = "" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName: username,
      email,
      passwordHash,
      avatar,
      playlists: []
    });

    const token = makeToken(user);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.userName,
        avatar: user.avatar,
        email: user.email
      }
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
// body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = makeToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.userName,
        avatar: user.avatar,
        email: user.email
      }
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
// header: Authorization: Bearer <token>
router.get("/me", authRequired, async (req, res) => {
  // req.user comes from auth middleware
  const user = req.user;
  res.json({
    _id: user._id,
    username: user.userName,
    avatar: user.avatar,
    email: user.email,
    playlists: user.playlists
  });
});

// PUT /api/auth/me
// header: Authorization: Bearer <token>
// body: { username, email, password?, avatar? }
router.put("/me", authRequired, async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }

    // ensure email uniqueness if changed
    if (email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const updates = {
      userName: username,
      email,
      avatar: typeof avatar === "string" ? avatar : req.user.avatar
    };

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    });

    const token = makeToken(updated);

    res.json({
      token,
      user: {
        _id: updated._id,
        username: updated.userName,
        avatar: updated.avatar,
        email: updated.email
      }
    });
  } catch (err) {
    console.error("update me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
