const validate = require('../../helper/validate/accountValidate');
const genSalt = require('../../helper/genSalt');
const http = require('../../const');
const db = require('../../database');

const DBHelper = require('../../helper/DBHelper/DBHelper')

exports.createAccount = async (accountObj) => {
    const valid = validate.validateAccount(accountObj);
    if (valid.error) {
        console.log(valid.error)
        return { message: valid.error.details[0].message }
    };
    // hash pw
    if (accountObj.password) {
        accountObj.password = genSalt.hashPassword(accountObj.password);
    }
    return DBHelper.insertData(accountObj, "account", true, 'id, email')
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

exports.getUserInfo = async (id) => {
    return DBHelper.getData('account', { id: id });
}

exports.updateUser = async (data) => {
    return DBHelper.updateData(data, "account", "id")
}

exports.updatePassword = async (id, currentPassword, newPassword) => {
    //get old password
    const res = await db.query(`
        SELECT password
        FROM account 
        WHERE (id = '${id}')
    `)
    const password = res.rows[0].password

    // check correct current password
    if (!genSalt.compare(currentPassword, password)) {
        return { message: "Password is incorrect." }
    }

    const valid = validate.validatePassword(newPassword);
    if (valid.error) return { message: valid.error.details[0].message }

    newPassword = genSalt.hashPassword(newPassword);
    const data = {
        id: id,
        password: newPassword
    }
    return DBHelper.updateData(data, "account", "id")
}