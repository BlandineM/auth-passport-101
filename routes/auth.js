const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { db, jwtOptions } = require("../conf");
require("../passport-strategies");
const router = express.Router();

router.post("/signup", (req, res) => {
  let formData = req.body;
  const hashedPassword = bcrypt.hashSync(
    formData.password,
    jwtOptions.saltRounds
  );
  formData.password = hashedPassword;
  db.query("INSERT INTO user SET ?", formData, (queryErr, queryRows) => {
    if (queryErr)
      return res.status(418).send("Error while recording new user!");
    delete formData.password;
    formData.id = queryRows.insertId;
    console.log(formData);
    return res
      .status(201)
      .send(jwt.sign(JSON.stringify(formData), jwtOptions.secret));
  });
});

router.post("/login", (req, res) => {
  passport.authenticate(
    "local",
    { session: false },
    (errAuth, user, infoAuth) => {
      if (errAuth)
        return res.status(500).json({
          tldr: "Tech error!",
          details: errAuth,
          message: infoAuth
        });

      if (!user)
        return res.status(401).json({
          tldr: "Form error!",
          details: "Either mail or password is incorrect",
          message: infoAuth
        });

      const token = jwt.sign(user, jwtOptions.secret);
      return res.status(200).json({ user, token });
    }
  )(req, res);
});

router.get("/profile", (req, res) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (errAuth, user, infoAuth) => {
      if (errAuth)
        return res.status(500).json({
          tldr: "Tech error!",
          details: errAuth,
          message: infoAuth
        });

      if (!user)
        return res.status(401).json({
          tldr: "Token error!",
          details: "The token you provided is incorrect",
          message: infoAuth
        });

      return res.status(200).json({
        profile: user,
        message: `Welcome ${user.firstname}, you're logged in !`
      });
    }
  )(req, res);
});

module.exports = router;
