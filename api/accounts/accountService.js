const mongoose = require('mongoose');
const Account = require('./accountModel');
const validate = require('../../helper/validate/accountValidate');
const genSalt = require('../../helper/genSalt');
const http = require('../../const');
const db = require('../../database');

const DBHelper = require('../../helper/DBHelper/DBHelper')

exports.createAccount = async (accountObj) => {
    const valid = validate.validateAccount(accountObj);
    if (valid.error) {
        console.log(valid.error)
        return { message: valid.error.details[0].message }};
    // hash pw
    accountObj.password = genSalt.hashPassword(accountObj.password);
    return DBHelper.insertData(accountObj,"account",true, 'id, email')
}
exports.createAccountWithSocialLogin = (accountObj) => {
    try {
        accountObj._id = mongoose.Types.ObjectId();
        const account = new Account(accountObj);
        return account.save();
    } catch {
        console.log(error);
        return null;
    }
}
exports.getUserByEmail = async (email) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM account 
            WHERE (email = '${email}')
        `)
        return result.rows[0];
        //return Account.findOne({email: email}, '_id email password');
    } catch (error) {
        console.log(error);
        return null;
    }

}

exports.findAccWithMail = (email) => {
    try {
        const account = Account.findOne({
            email: email
        })
        return account;
    } catch (error) {
        console.log(error);
        return null;
    }

}
exports.updateUser = async (data) => {
    return DBHelper.updateData(data, "account", "id")
}
exports.updateInfoForOneField = (fieldNeedUpdate, data, emailSearch) => {
    try {
        let fieldToUpdate = {
            [fieldNeedUpdate]: data
        }
        const account = Account.findOneAndUpdate({
            email: emailSearch
        }, { $set: fieldToUpdate })
        return account;
    } catch (error) {
        console.log(error);
        return null;
    }
}