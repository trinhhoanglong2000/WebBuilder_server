const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

const accountService = require('../../api/accounts/accountService');
const genSalt = require('../genSalt');

passport.use(new LocalStrategy(
  async function(email, password, done) {
    const acc = await accountService.getUserByEmail(email);
    if (acc) {
      if (genSalt.compare(password, acc.password)) {
          return done(null, {_id: acc._id, email: email});
      }
    }
    return done(null, false, {message: 'incorect usernanme or password!'});
  }
));

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload);
    return done(null, {_id: jwt_payload._id, email: jwt_payload.email}) // req.user
}));

module.exports = passport;