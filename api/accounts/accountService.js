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
        if (valid.error) return { message: result.error.details[0].message };

        // hash pw
        accountObj.password = genSalt.hashPassword(accountObj.password);

        // create

        const result = await db.query(`
            INSERT INTO account (id, email, password, fullname, phone, gender, "DOB") 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            returning id; `,
            [uuidv4(), accountObj.email, accountObj.password, accountObj.fullname, accountObj.phone, accountObj.gender, accountObj.DOB]
        );

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
exports.getUserByEmail = async (email) => {
    try {
        const result = await db.query(`
            SELECT id, email, password 
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
    console.log(JSON.stringify(data))
    try {
        
        // const result = await db.query(`
        // with source as (SELECT * FROM jsonb_populate_record(NULL::account, 
        //     '${JSON.stringify(data)}'::jsonb))
        // update account
        // set (fullname,phone) = (j.fullname,j.phone)
        // from source AS j
        // where account.id = j.id;
        //     `);
        const result = await db.query(`
        with jsondata(jdata) as (
            values ('${JSON.stringify(data)}'::jsonb)
        )
        update account
        set (fullname,phone) = (select fullname, phone
            from jsonb_populate_record(NULL::account, to_jsonb(account) || jdata))
        from jsondata
            where account.id = (jdata->>'id')::text;
            `);
        return result;
        //return Account.findOne({email: email}, '_id email password');
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
        }, { $set: fieldToUpdate })
        return account;
    } catch (error) {
        console.log(error);
        return null;
    }
}