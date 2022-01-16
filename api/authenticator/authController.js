const authService = require('./authService');

exports.googleSignIn = async (req,res,next) => {
    const passport  = await authService.googleSignIn(req.body.id_token);
    res.json(passport);
}

exports.facebookSignIn = async (req,res,next) => {
    await authService.facebookSignIn(req.body.id_token, (passport) => {
        console.log(passport);
        res.json(passport);
    });
}