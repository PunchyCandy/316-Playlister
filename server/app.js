const express = require("express");
const cors = require("cors");
const playlisterRouter = require("./routes/playlisterRouter");
const authRouter = require("./routes/authRouter");

const app = express();
app.use(cors());
// Allow base64 avatars in JSON payloads (default 100kb is too small)
app.use(express.json({ limit: "5mb" }));

app.use("/api", playlisterRouter);
app.use("/api/auth", authRouter);

module.exports = app;
