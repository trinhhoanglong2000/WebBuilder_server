const mongoose = require('mongoose');
const Account = require('./accountModel');
const validate = require('../../modules/validate');
const genSalt = require('../../modules/genSalt');

exports.createAccount = (accountObj) => {

    // check validate
    const result = validate.validateAccount(accountObj);
    if (result.error) throw err;
    
    // hash pw
    accountObj.password = genSalt.hashPassword(accountObj.password);

    // create
    accountObj._id = mongoose.Types.ObjectId();
    const account = new Account(accountObj);
    return account.save();
}

exports.getUserByEmail = (email) => {
    return Account.findOne({email: email}, '_id email password');
}