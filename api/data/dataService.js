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
    let dataFromCurrency = await getCurreny(query.from).then(res => res[0])
    let dataToCurrency = await getCurreny(query.to).then(res => res[0])
    let value = query.price

    if(query.to == query.from){
        return parseFloat(value)
    }
    switch (query.to) {
        case "VND":
            return Math.ceil(value * Number(dataToCurrency.amount) / Number(dataFromCurrency.amount));
            break;
        case "USD":
            return parseFloat(value * Number(dataToCurrency.amount) / Number(dataFromCurrency.amount) + 0.004).toFixed(2);
            break;
        default:
            return parseFloat(value * Number(dataToCurrency.amount) / Number(dataFromCurrency.amount) + 0.004).toFixed(2);
            break;
    }
}

var getCurreny = exports.getCurreny = async (name) => {
    return DBHelper.getData("currency", { currency: name })
}

exports.getRate = async () => {
    return DBHelper.getData("currency")
}