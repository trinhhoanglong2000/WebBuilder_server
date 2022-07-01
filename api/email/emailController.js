const emailService = require('./emailService');
const http = require('../../const');

exports.SendOTP = async (req, res) => {
    const mail = req.body.mail;

    const result = await emailService.sendVerifyEmail(mail);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "OPT was sent!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.configEmail = async (req, res) => {
    const data = req.body
    if (!data.id || !data.smtp || !data.email|| !data.password) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }
    const result = await emailService.configEmail(data)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Config store email successfully"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.resetEmail = async (req, res) => {
    const data = req.body
    if (!data.id) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }
    const result = await emailService.resetEmail(data)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Reset Email Successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.updateConfigEmail = async (req, res) => {
    const data = req.body
    if (!data.id) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }
    const result = await emailService.updateConfigEmail(data)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Update Config Successfully"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getConfigEmail = async (req, res) => {
    const data = {
        id : req.params.id
    }
    
    const result = await emailService.getStoreEmail(data)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get store config email successfully"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};