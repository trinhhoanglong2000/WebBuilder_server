const mongoose = require('mongoose');
const Account = require('./accountModel');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const validateAccount = (accountObj) => {
    var schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2}).required(),
        password: Joi.string().min(8).max(30).required(),
        fullname: Joi.string().required(),
        phone: Joi.string().alphanum().length(10).required(),
        gender: Joi.boolean().required(),
        DOB: Joi.date(),
        fbID: Joi.string(),
        ggID: Joi.string()
    });
    return schema.validate(accountObj);
}

exports.createAccount = (accountObj) => {

    // check validate
    const result = validateAccount(accountObj);
    if (result.error) throw err;
    
    // hash pw
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(accountObj.password, salt);
    accountObj.password = hash


    // create
    accountObj._id = mongoose.Types.ObjectId();
    const account = new Account(accountObj);
    return account.save();
}