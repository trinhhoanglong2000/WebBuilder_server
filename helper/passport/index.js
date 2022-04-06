const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

const accountService = require("../../api/accounts/accountService");
const genSalt = require("../genSalt");

passport.use(
  new LocalStrategy(
    {
      // define the parameter in req.body that passport can use as username and password
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      const acc = await accountService.getUserByEmail(email);
      if (acc) {
        if (genSalt.compare(password, acc.password)) {
          return done(null, { id: acc.id, email: email });
        }
      }
      return done(null, false, { message: "incorect usernanme or password!" });
    }
  )
);

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    return done(null, { id: jwt_payload.id, email: jwt_payload.email }); // req.user
  })
);

module.exports = passport;
