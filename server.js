const express = require("express");
const middlewares = require("./middleware/middleware");
const routes = require("./routes/routes");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const path = require("path");
const db = require("./DB/db");

db();
middlewares(app);
routes(app);

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log("Server running on port" + PORT);
});
