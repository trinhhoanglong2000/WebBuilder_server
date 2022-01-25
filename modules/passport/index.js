const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

const accountService = require('../../api/accounts/accountService');

passport.use(new LocalStrategy(
  async function(username, password, done) {
    const acc = await accountService.findAcc(username);
    if (acc) {
      if (acc.password == password) {
          return done(null, {id: acc.id, username: username});
      }
    }
    return done(null, false, {message: 'incorrect'});
  }
));

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload);
    return done(null, {id: jwt_payload.id, username: jwt_payload.username}) // req.user
}));

module.exports = passport;