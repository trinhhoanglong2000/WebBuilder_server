const authService = require('./authService');
const http = require('../../const');
const passport = require('../../helper/passport');
const jwt = require('jsonwebtoken');
const accountService = require('../accounts/accountService');
const templateService = require('../template/templateService');
const emailService = require('../email/emailService');
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
                        id: user.id,
                        email: user.email,
                    }, process.env.JWT_SECRET, {
                        expiresIn: '365d'
                    })
                },
                message: "Login sucessfully!"
            });
        }
    )(req, res, next);
}

exports.googleSignIn = async (req, res, next) => {
    const passport = await authService.googleSignIn(req.body.id_token, req.body.access_token);
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

exports.facebookSignIn = async (req, res, next) => {
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
    const accountObj = req.body
    const isExist = await accountService.getUserByEmail(accountObj.email)
    if (isExist) {
        res.status(http.Conflict).json({
            statusCode: http.Conflict,
            message: 'Email already taken.'
        })
        return;
    }

    const newAccount = await accountService.createAccount(accountObj);

    if (newAccount) {
        if (newAccount.message) {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: newAccount.message
            })
        }
        else {
            let query = {
                name: "template-default"
            }
            const getTemplate = await templateService.getTemplate(query)
            let addQuery = {
                user_id: newAccount.rows[0].id,
                template_id: getTemplate[0].id
            }
            const addTemplate = await templateService.insertTemplateUser(addQuery)

            const { email, id } = newAccount.rows[0]
            const isSentEmail = await emailService.sendVerifyEmail(email, id)
            if (isSentEmail) {
                res.status(http.Created).json({
                    statusCode: http.Created,
                    data: newAccount.rows[0],
                    message: "Register successfully. Verifycation email sent."
                })
            }
            else {
                res.status(http.ServerError).json({
                    statusCode: http.ServerError,
                    message: "Register successfully. Verifycation email was not sent."
                })
            }
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.requestResetPassword = async (req, res) => {
    const email = req.body.email
    const result = await emailService.sendResetPasswordEmail(email)
    if (result) {
        let statusCode = http.Success
        if (!result.success) statusCode = http.NotAcceptable
        res.status(statusCode).json({
            statusCode: statusCode,
            message: result.message
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.resetPassword = async (req, res) => {
    const { user_id, reset_string, new_password } = req.body
    const result = await accountService.resetPassword(user_id, reset_string, new_password);
    if (result) {
        let statusCode = http.Success
        if (!result.success) statusCode = http.NotAcceptable
        res.status(statusCode).json({
            statusCode: statusCode,
            message: result.message
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}