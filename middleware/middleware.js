const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const Ddos = require("ddos");
const router = require("express").Router();

module.exports = function(app) {
  const ddos = new Ddos({ burst: 10, limit: 15 });

  router.use(ddos.express);
  app.use(helmet());

  app.set("view engine", "ejs");
  app.set("views", "views");
  app.use(cors());
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );

  app.use(bodyParser.json());
};
