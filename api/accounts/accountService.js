const mongoose = require('mongoose');
const Account = require('./accountModel');
const validate = require('../../helper/validate/accountValidate');
const genSalt = require('../../helper/genSalt');
const http = require('../../const');
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createAccount = async (accountObj) => {
    try {
        // check validate
        const valid = validate.validateAccount(accountObj);
        if (valid.error) return {message: result.error.details[0].message};
    
        // hash pw
        accountObj.password = genSalt.hashPassword(accountObj.password);

        // create
        // accountObj._id = mongoose.Types.ObjectId();
        // const account = new Account(accountObj);
        // return account.save();
        
        const result = await db.query(`
            INSERT INTO account (id, email, password, fullname, phone, gender, "DOB") 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            returning id;
            `, [uuidv4(), accountObj.email, accountObj.password, accountObj.fullname, accountObj.phone, accountObj.gender, accountObj.DOB])

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
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
exports.getUserByEmail = (email) => {
    try {
        return Account.findOne({email: email}, '_id email password');
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
exports.updateInfoForOneField = (fieldNeedUpdate, data, emailSearch) => {
    try {
        let fieldToUpdate = {
            [fieldNeedUpdate]: data
        }
        const account = Account.findOneAndUpdate({
            email: emailSearch
        }, {$set: fieldToUpdate})
        return account;
    } catch (error) {
        console.log(error);
        return null;
    }
}