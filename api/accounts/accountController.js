const accountService = require('./accountService');
const http = require('../../const');

exports.createAccount = async (req, res) => {
    // check exist account
    const is_existed = await accountService.getUserByEmail(req.body.email);
    if (is_existed) {
        res.status(http.Conflict).json({
            statusCode: http.Conflict,
            message: "email was taken!"
        })
        return;
    }
    
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
        res.status(http.Created).json({
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

exports.getUserByEmail = async (req, res) => {
    const result = await accountService.getUserByEmail('nvx.pnhatminh@gmail.com');
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