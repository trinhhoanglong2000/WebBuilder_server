const accountService = require('./accountService');
const http = require('../../const');


exports.getUserByEmail = async (req, res) => {
    //user: { _id: '6211f270291ae1981a20f75e', email: 'longem@gmail.com' },
    const result = await accountService.getUserByEmail(req.user.email);
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

exports.getUserInfo = async (req, res) => {
    //user: { _id: '6211f270291ae1981a20f75e', email: 'longem@gmail.com' },
    const result = await accountService.getUserInfo(req.user.id);
    const {id, email , fullname, phone, gender, dob} = result[0];
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                id, email, fullname, phone, gender, dob
            },
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
    const data = {
        ...req.body,
        id: req.user.id
    }
    const result = await accountService.updateUser(data);
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

exports.UpdatePassword = async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const result = await accountService.updatePassword(req.user.id, currentPassword, newPassword);
    if (result) {
        if (result.message) {
            return res.status(http.NotAcceptable).json({
                statusCode: http.NotAcceptable,
                message: result.message
            })
        }
        res.status(http.Success).json({
            statusCode: http.Success,
            message: "change password successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}