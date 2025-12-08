const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectToDatabase } = require("./db");
const playlisterRouter = require("./routes/playlisterRouter");
const authRouter = require("./routes/authRouter");

const app = express();
app.use(cors());
// Allow base64 avatars in JSON payloads (default 100kb is too small)
app.use(express.json({ limit: "5mb" }));

app.use("/api", playlisterRouter);
app.use("/api/auth", authRouter);

const PORT = 4000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Playlister server running at http://localhost:${PORT}`);
  });
});
