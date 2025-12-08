const express = require("express");
const cors = require("cors");

const playlisterRouter = require("./routes/playlisterRouter");

const app = express();
app.use(cors());
app.use(express.json()); // auto-parses JSON

app.use("/api", playlisterRouter);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Playlister server running at http://localhost:${PORT}`);
});
