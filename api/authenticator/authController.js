const authService = require('./authService');
const http = require('../../const');
const passport = require('../../helper/passport');
const jwt = require('jsonwebtoken');
const accountService = require('../accounts/accountService');

exports.signIn = (req, res, next) => {
    passport.authenticate(
        "local",
        {
          session: false,
        },
        function (err, user, info) {
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
                  expiresIn: '10h'
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
exports.createAccount = async (req, res) => {
    // check exist account
    // const is_existed = await accountService.getUserByEmail(req.body.email);
    // if (is_existed) {
    //     res.status(http.Conflict).json({
    //         statusCode: http.Conflict,
    //         message: "email was taken!"
    //     })
    //     return;
    // }
    
    // create new acc
    const accountObj = {
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        phone: req.body.phone,
        gender: req.body.gender,
        DOB: req.body.DOB,
        fbID: req.body.fbID,
        ggID: req.body.ggID
    }
    const newAccount = await accountService.createAccount(accountObj);
    if (newAccount) {
        if (newAccount.message) {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: newAccount.message
            })
        }
        else res.status(http.Created).json({
            statusCode: http.Created,
            data: newAccount,
            message: "Register successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

