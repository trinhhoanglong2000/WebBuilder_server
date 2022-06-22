//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const { text } = require('body-parser');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.getCity = () => {
    const config = {
        order: [{name : "ASC"}]
    }

    return DBHelper.FindAll("city",config)
}

exports.getDistrict = (id) => {
    const config = {
        where: {city_id : id},
        order: [{name : "ASC"}]
    }

    return DBHelper.FindAll("district",config)
}