const authService = require('./authService');

exports.googleSignIn = async (req,res,next) => {
    const passport  = await authService.googleSignIn(req.body.id_token, req.body.access_token);
    if (passport) {
        res.status(200).json({
            statusCode: 201,
            data: passport,
            message: "get user successfully!"
        })
    }
    else {
        res.status(500).json({
            statusCode: 500,
            message: "Server error!"
        })
    }
}

exports.facebookSignIn = async (req,res,next) => {
    await authService.facebookSignIn(req.body.id_token, (passport) => {
        if (passport) {
            res.status(200).json({
                statusCode: 201,
                data: passport,
                message: "get user successfully!"
            })
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: "Server error!"
            })
        }
    });
}