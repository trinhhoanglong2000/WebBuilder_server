const mongoose = require('mongoose');
const Account = require('./accountModel');

exports.createAccount = (accountObj) => {
    const account = new Account({
        _id: mongoose.Types.ObjectId(),
        email: accountObj.email,
        password: accountObj.password,
        phone: accountObj.phone,
        gender: accountObj.gender,
        DOB: accountObj.DOB
    });
    
    return account.save();
}