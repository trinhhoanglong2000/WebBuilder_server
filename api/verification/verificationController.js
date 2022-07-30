const verificationService = require('./verificationService')
const http = require('../../const');
const path = require("path");

exports.verify = async (req, res) => {
    const {userId, uniqueString} = req.params;
    const result = await verificationService.verify(userId, uniqueString)
    if (result) {
        if (result.success) {
            // res.sendFile(path.join(__dirname, "../../views/verify/verify.html"))
            res.redirect(`/verify/verified?clientURL=${process.env.MANAGEMENT_CLIENT_URL}&email=${result.email}`)
        }
        else {
            res.redirect(`/verify/verified?error=true&message=${result.message}`)
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.verified = (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/verify/verify.html"))
}