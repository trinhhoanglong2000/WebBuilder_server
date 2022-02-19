const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('./index');
const http = require('../../const');

/* GET home page. */
// router.post('/', passport.authenticate('local', {session: false}), function(req, res, next) {
//   if (req.user.message) {
//     return res.json({
//       statusCode: 401,
//       message: req.user.message
//     });
//   }
//   else res.json({
//     statusCode: 200,
//     data: {
//       user: req.user,
//       token: jwt.sign({
//           _id: req.user._id,
//           email: req.user.email,
//       }, process.env.JWT_SECRET, {
//           expiresIn: '1h'
//       })
//     },
//     message: "Login sucessfully!"
//   }); 
// });

router.post("/", function (req, res, next) {
  passport.authenticate(
    "local",
    {
      session: false,
    },
    function (err, user, info) {
      console.log(user);
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(http.Unauthorized).json({
          statusCode: http.Unauthorized,
          message: info.message
        });
      }
      return res.status(http.Success).json({
        statusCode: http.Success,
        data: {
          user: user,
          token: jwt.sign({
              _id: user._id,
              email: user.email,
          }, process.env.JWT_SECRET, {
              expiresIn: '1h'
          })
        },
        message: "Login sucessfully!"
      }); 
    }
  )(req, res, next);
});


module.exports = router;
