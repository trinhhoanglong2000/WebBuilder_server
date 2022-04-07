const accountService = require('./accountService');
const http = require('../../const');


exports.getUserByEmail = async (req, res) => {
    //user: { _id: '6211f270291ae1981a20f75e', email: 'longem@gmail.com' },
    const result = await accountService.findAccWithMail(req.user.email);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "get user successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}
exports.UpdateUser = async (req, res) => {
    //user: { _id: '6211f270291ae1981a20f75e', email: 'longem@gmail.com' },
    const result = await accountService.updateUser(req.body);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "update user successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}