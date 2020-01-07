const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JWTStrategy, ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcrypt");
const { db, jwtOptions } = require("./conf");

passport.use(
  new LocalStrategy(
    {
      usernameField: "mail",
      passwordField: "password"
    },
    (formMail, formPassword, done) => {
      db.query(
        "SELECT id, mail, password, firstname, lastname from user WHERE mail=? LIMIT 1",
        formMail,
        (queryErr, queryRows) => {
          if (queryErr)
            return done(queryErr, false, "Error while fetching user!");
          if (!queryRows[0]) return done(null, false, "User not found!");
          const { id, mail, firstname, lastname } = queryRows[0];
          const user = { id, mail, firstname, lastname };

          const isPasswordOK = bcrypt.compareSync(
            formPassword,
            queryRows[0].password
          );
          if (!isPasswordOK) return done(null, false, "Wrong password!");
          return done(null, user);
        }
      );
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtOptions.secret
    },
    (jwtPayload, done) => {
      const user = jwtPayload;
      return done(null, user);
    }
  )
);
