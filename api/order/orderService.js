const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const URLParser = require('../../helper/common/index')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
const { config } = require('dotenv');

exports.createOrder = async (query) => {
    if (query.discount_id) {
        //DO STH
    }
    return DBHelper.insertData(query, "orders", false, "id")
}

exports.createOrderId = async () => {
    let orderId = URLParser.generateCode()
    let checkExist = await getAllOrder({ id: orderId })
    while (checkExist.length > 0) {
        orderId = URLParser.generateCode()
        checkExist = await getAllOrder({ id: orderId })
    }
    return orderId
}

exports.createOrderProduct = async (query) => {
    return DBHelper.insertData(query,"order_products",true)
}

var getAllStoreOrder = exports.getAllStoreOrder = async (query) => {
    const config = {
        where: {
            "store_id": query.store_id
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("order", config)
}

var getAllOrder = exports.getAllOrder = async (query) => {
    const config = {
        where: {
            "id": query.id
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("orders", config)
}

exports.createOrderStatus = async (query) => {
    return DBHelper.insertData(query,"order_status",true,"id")
}