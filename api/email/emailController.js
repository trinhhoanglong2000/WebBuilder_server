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