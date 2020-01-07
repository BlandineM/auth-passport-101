const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { backPort } = require("./conf");

/* --------------------------------------------------------------------- Tools */
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

/* --------------------------------------------------------------------- Routes */
app.get("/", (req, res) => {
  const msg =
    "Welcome on Authentication-101! Feel free to read the README.md file";
  res.status(200).send(msg);
});

app.use("/auth", require("./routes/auth"));

app.use("/", require("./routes/misc"));

/* --------------------------------------------------------------------- 404 and server launch */
app.use((req, res, next) => {
  const msg = `Page not found: ${req.url}`;
  console.warn(msg);
  res.status(404).send(msg);
});

app.listen(backPort, () => {
  console.log(`API root available at: http://localhost:${backPort}/`);
});
