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
            data: newAccount,
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

exports.getUserByEmail = async (req, res) => {
    const result = await accountService.getUserByEmail('user1@gmail.com');
    if (result) {
        res.status(200).json({
            statusCode: 201,
            data: result,
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