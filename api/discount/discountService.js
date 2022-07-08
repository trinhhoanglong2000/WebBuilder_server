//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const storeService = require('../stores/storeService')
const DBHelper = require('../../helper/DBHelper/DBHelper')
const URLParser = require('../../helper/common/index')
const { text } = require('body-parser');

exports.createDiscount = async (query) => {
    //const date = new Date(query.start_at)
    return DBHelper.insertData(query, "discount", true, "id")
}

exports.deleteDiscount = async (query) => {
    return DBHelper.deleteData("discount",query)
}

exports.updateDiscount = async (query) => {
    return DBHelper.updateData(query,"discount","id")
}

var findDiscount = exports.findDiscount = async (query) => {
    return DBHelper.getData("discount", query)
}

exports.getDiscountById = async (id) => {
    return DBHelper.getData("discount", {id: id})
}

exports.findAllDiscount = async (query) => {
    let condition = [];
    let offset = query.offset
    let limit = query.limit

    if (query.offset) {
        delete query["offset"]
    }

    if (query.limit) {
        delete query["limit"]
    }
    let arr = Object.keys(query)
    let arr1 = Object.values(query)

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "code") {
            let queryTemp = {}
            queryTemp[`UPPER(${arr[i]})`] = { "OP.ILIKE": "%" + arr1[i].toUpperCase().trim() + "%" }
            condition.push(queryTemp)
        }
        else {
            let queryTemp = {}
            queryTemp[`${arr[i]}`] = arr1[i]
            condition.push(queryTemp)
        }

    }
    let config = {
        where : {"OP.AND" : condition},
        offset : offset,
        limit : limit
    }
    return DBHelper.FindAll("discount",config)
}

exports.generateCode = async (query) => {
    let discountCode = URLParser.generateCode()
    let checkExist = await findDiscount({ code: discountCode, store_id: query.store_id })
    while (checkExist.length > 0) {
        discountCode = URLParser.generateCode()
        checkExist = await findDiscount({ code: discountCode, store_id: query.store_id })
    }
    return discountCode
}

exports.useDiscount = async(query) => {
    
}