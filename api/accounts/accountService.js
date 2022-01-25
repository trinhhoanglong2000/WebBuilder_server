const mongoose = require('mongoose');
const Account = require('./accountModel');

exports.createAccount = (accountObj) => {
    const account = new Account({
        _id: mongoose.Types.ObjectId(),
        email: accountObj.email,
        password: accountObj.password,
        fullname: accountObj.fullname,
        phone: accountObj.phone,
        gender: accountObj.gender,
        DOB: accountObj.DOB,
        fbID: accountObj.fbID,
        ggID: accountObj.ggID
    });
    
    return account.save();
}