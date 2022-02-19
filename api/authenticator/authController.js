const authService = require('./authService');
const http = require('../../const');
const passport = require('../../helper/passport');
const jwt = require('jsonwebtoken');

exports.signIn = (req, res, next) => {
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
}

exports.googleSignIn = async (req,res,next) => {
    const passport  = await authService.googleSignIn(req.body.id_token, req.body.access_token);
    if (passport) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: passport,
            message: "Login sucessfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.facebookSignIn = async (req,res,next) => {
    await authService.facebookSignIn(req.body.id_token, (passport) => {
        if (passport) {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: passport,
                message: "Login sucessfully!"
            })
        }
        else {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server error!"
            })
        }
    });
}