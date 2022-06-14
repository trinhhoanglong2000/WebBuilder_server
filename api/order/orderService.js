const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const URLParser = require('../../helper/common/index')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
const { config } = require('dotenv');
const productService = require("../products/productService")
const variantService = require("../variants/VariantsService")
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
    return DBHelper.insertData(query, "order_products", true)
}
var getOrderProduct = exports.getOrderProduct = async (query) => {
    const config = {
        where: {
            "order_id": query.order_id
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("order_products", config)
}
var getAllStoreOrder = exports.getAllStoreOrder = async (query) => {
    const config = {
        where: {
            "store_id": query.store_id
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("orders", config)
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
    let newStatus
    if (query.status == "RESTOCK") {
        const allProduct = await getOrderProduct({ order_id: query.order_id })
        for (let i = 0; i < allProduct.length; i++) {
            if (allProduct[i].is_variant){
                const variant = await variantService.getVariantById(allProduct[i].variant_id)
                let remainQuantity = variant[0].quantity - allProduct[i].quantity
                remainQuantity = remainQuantity < 0 ? 0 : remainQuantity
                await variantService.updateVariant({id : variant[0].id, quantity: remainQuantity})
                await productService.updateInventoryFromVariants(allProduct[i].product_id)
            }
            else {
                const product = await productService.findById(allProduct[i].product_id)
                let remainQuantity = product[0].inventory - allProduct[i].quantity
                remainQuantity = remainQuantity < 0 ? 0 : remainQuantity
                await productService.updateProduct({id : product[0].id, inventory : remainQuantity})
            }
        }
        newStatus = "CREATED"
    }
    else if (query.status == "CREATED"){
        newStatus = "CONFIRMED"
    }
    else if (query.status == "CONFIRMED"){
        newStatus = "SHIPPING"
    }
    else if (query.status == "SHIPPING"){
        newStatus = "COMPLETED"
    }
    else {
        return null
    }

    const createQuery = {
        order_id : query.order_id,
        status : newStatus
    }
    return DBHelper.insertData(createQuery, "order_status", true, "id")
}