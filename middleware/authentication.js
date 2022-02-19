const passport = require('passport')

exports.Authenticate = (req, res, next) => {
    passport.authenticate(
      "jwt",
      {
        session: false,
      },
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          res.header({ "Access-Control-Allow-Origin": "*" });
          res.status(401);
          res.send({message:info.message,success:false});
          return;
        }
        
        req.user = user
        next();
      }
    )(req, res, next);
}