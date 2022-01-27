const authService = require('./authService');
const http = require('../../const');
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