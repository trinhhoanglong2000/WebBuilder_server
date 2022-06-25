const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const URLParser = require('../../helper/common/index')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
const { config } = require('dotenv');
const productService = require("../products/productService")
const variantService = require("../variants/VariantsService")
const nodemailer = require('nodemailer');
const ggAuth = require('google-auth-library');
const emailService = require('../email/emailService')
const accountService = require('../accounts/accountService')
exports.createOrder = async (query) => {
    if (query.discount_id) {
        //DO STH
    }
    const result = await DBHelper.insertData(query, "orders", false, "id")

    //MAIL
    const storeData = await storeService.findById(query.store_id)
    let mailStoreQuery = {
        store_id: query.store_id,
        subject: `Order #${query.id} successfully created`,
        receiver: `${query.email}`,
        html: `<p>Your order <a href=${storeData.store_link + "/orders/" + query.id}>#${query.id}</a> from ${storeData.name} has been successfully created</p> <br>
        <p>You can view your order status by click the link above or visit our website at  <a href=${storeData.store_link}>${storeData.store_link}</a> to proceed.</p>
        `
    }
    const account = await accountService.getUserInfo(storeData.user_id)
    let mailQuery = {
        subject: `Order #${query.id} successfully created`,
        receiver: `${account[0].email}`,
        html: `<p>New order #${query.id} have been create from store ${storeData.name}</p> <br>
        <p>You can view your order status by go to <a href=${process.env.MANAGEMENT_CLIENT_URL}>easymall.site</a> to proceed.</p>
        `
    }

    await emailService.adminSendMail(mailQuery)
    await emailService.sendMailFromStore(mailStoreQuery)
    return result
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
    const condition = []
    if (query.id) {
        condition.push({ [`UPPER(id)`]: { "OP.ILIKE": "%" + query.id.toUpperCase().trim() + "%" } })
    }
    condition.push({ "store_id": query.store_id })

    const config = {
        where: {
            "OP.AND": condition
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("orders", config)
}

var getAllOrder = exports.getAllOrder = async (query) => {
    let condition = [];
  
    let arr = Object.keys(query)
    let arr1 = Object.values(query)

    for (let i = 0; i < arr.length; i++) {
        let queryTemp = {}
        queryTemp[`${arr[i]}`] = arr1[i]
        condition.push(queryTemp)
    }
    const config = {
        where: {
            "OP.AND": condition
        },
    }

    return DBHelper.FindAll("orders", config)
}

exports.getAllOrderStatus = async (query) => {
    const config = {
        where: {
            "order_id": query.order_id
        },
        order: [{ create_at: "DESC" }]
    }
    return DBHelper.FindAll("order_status", config)
}

exports.createOrderStatus = async (query) => {
    return DBHelper.insertData(query, "order_status", true, "id")
}
exports.changeOrderStatus = async (query) => {
    let newStatus
    if (query.status == "RESTOCK") {
        const allProduct = await getOrderProduct({ order_id: query.order_id })
        for (let i = 0; i < allProduct.length; i++) {
            if (allProduct[i].is_variant) {
                const variant = await variantService.getVariantById(allProduct[i].variant_id)
                if (variant.length > 0) {
                    let remainQuantity = variant[0].quantity - allProduct[i].quantity
                    remainQuantity = remainQuantity < 0 ? 0 : remainQuantity
                    await variantService.updateVariant({ id: variant[0].id, quantity: remainQuantity })
                    await productService.updateInventoryFromVariants(allProduct[i].product_id)
                }
            }
            else {
                const product = await productService.findById(allProduct[i].product_id)
                if (product.length > 0) {
                    let remainQuantity = product[0].inventory - allProduct[i].quantity
                    remainQuantity = remainQuantity < 0 ? 0 : remainQuantity
                    await productService.updateProduct({ id: product[0].id, inventory: remainQuantity })
                }
            }
        }
        newStatus = "CREATED"
    }
    else if (query.status == "CREATED") {
        newStatus = "CONFIRMED"
    }
    else if (query.status == "CONFIRMED") {
        newStatus = "SHIPPING"
    }
    else if (query.status == "SHIPPING") {
        newStatus = "COMPLETED"
    }
    else {
        return null
    }

    const createQuery = {
        order_id: query.order_id,
        status: newStatus
    }
    return DBHelper.insertData(createQuery, "order_status", true, "id")
}

exports.CreateStatusdeleteOrder = async (query) => {
    return DBHelper.insertData(query, "order_status", true, "id")
}
exports.deleteOrderStatus = async (query) => {
    return DBHelper.deleteData("order_status", query)
}
exports.deleteOrderProducts = async (query) => {
    return DBHelper.deleteData("order_products", query)
}
exports.deleteOrder = async (query) => {
    return DBHelper.deleteData("orders", query)
}