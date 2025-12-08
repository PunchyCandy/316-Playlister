require("dotenv").config();
const { connectToDatabase } = require("./db");
const app = require("./app");

const PORT = 4000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Playlister server running at http://localhost:${PORT}`);
  });
});
