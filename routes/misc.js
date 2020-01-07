const express = require("express");
const passport = require("passport");
require("../passport-strategies");
const router = express.Router();

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
