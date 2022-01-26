const mongoose = require('mongoose');
const Account = require('./accountModel');
const validate = require('../../modules/validate');
const genSalt = require('../../modules/genSalt');

exports.createAccount = (accountObj) => {

    // check validate
    const result = validate.validateAccount(accountObj);
    if (result.error) return false;
    
    // hash pw
    accountObj.password = genSalt.hashPassword(accountObj.password);

    // create
    accountObj._id = mongoose.Types.ObjectId();
    const account = new Account(accountObj);
    return account.save();
}
exports.createAccountWithSocialLogin = (accountObj) => {
    accountObj._id = mongoose.Types.ObjectId();
    console.log(accountObj);
    const account = new Account(accountObj);
    return account.save();
}
exports.getUserByEmail = (email) => {
    return Account.findOne({email: email}, '_id email password');
}

exports.findAccWithMail = (emaila) => {
    const account = Account.findOne({
        email: emaila
    })
    return account;
}
exports.updateInfoForOneField = (fieldNeedUpdate, data, emailSearch) => {
    let fieldToUpdate = {
        [fieldNeedUpdate]: data
    }
    const account = Account.findOneAndUpdate({
        email: emailSearch
    }, {$set: fieldToUpdate})
    return account;
}