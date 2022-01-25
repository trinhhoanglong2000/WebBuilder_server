const mongoose = require('mongoose');
const accountService = require('./accountService');

exports.createAccount = async (req, res) => {
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
        res.status(201).json({
            statusCode: 201,
            data: accountObj,
            message: "Register successfully!"
        })
    }
    else {
        res.status(500).json({
            statusCode: 500,
            message: "Server error!"
        })
    }
}