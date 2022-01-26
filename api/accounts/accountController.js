const accountService = require('./accountService');

exports.createAccount = async (req, res) => {
    // check exist account
    const is_existed = await accountService.getUserByEmail(req.body.email);
    if (is_existed) {
        res.status(409).json({
            statusCode: 409,
            message: "email was taken!"
        })
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
    const result = await accountService.getUserByEmail('nvx.pnhatminh@gmail.com');
    if (result) {
        res.status(200).json({
            statusCode: 200,
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