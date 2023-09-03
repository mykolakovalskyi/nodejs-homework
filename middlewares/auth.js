const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("../models/user.model");
require("dotenv").config();
const secret = process.env.SECRET_KEY;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, function (payload, done) {
    User.find({ _id: payload.id })
      .then(([user]) => {
        if (!user) {
          return done(new Error("User not found"));
        }
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);

module.exports = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      if (!user || err || !token || token !== user.token) {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Unauthorized",
          data: "Unauthorized",
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
  })(req, res, next);
};
