//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const { text } = require('body-parser');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.getCity = async () => {
    const config = {
        order: [{ name: "ASC" }]
    }

    return DBHelper.FindAll("city", config)
}

exports.getDistrict = async (id) => {
    const config = {
        where: { city_id: id },
        order: [{ name: "ASC" }]
    }

    return DBHelper.FindAll("district", config)
}

exports.changeMoney = async (query) => {
    const fromRate = await getCurreny(query.from)
    const toRate = await getCurreny(query.to)
    if (fromRate.length && toRate.length) {
        return query.price * toRate[0].amount / fromRate[0].amount
    }
    else {
        return null
    }
}

var getCurreny = exports.getCurreny = async (name) => {
    return DBHelper.getData("currency", { currency: name })
}