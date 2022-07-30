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
const accountService = require('../accounts/accountService');
const fetch = require('node-fetch');
const db = require('../../database');
exports.createOrder = async (query) => {
    if (query.discount_id) {
        //DO STH
    }
    const result = await DBHelper.insertData(query, "orders", false, "id")


    return result
}

exports.createOrderId = async () => {
    let orderId = URLParser.generateCodeNumber()
    let checkExist = await getAllOrder({ id: orderId })
    while (checkExist.length > 0) {
        orderId = URLParser.generateCodeNumber()
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

    let arr = Object.keys(query)
    let arr1 = Object.values(query)

    //console.log(query)
    for (let i = 0; i < arr.length; i++) {
        let queryTemp = {}
        if (arr[i] == "id") {
            queryTemp[`UPPER(id)`] = { "OP.ILIKE": "%" + query.id.toUpperCase().trim() + "%" }
            //condition.push({ [`UPPER(id)`]: { "OP.ILIKE": "%" + query.id.toUpperCase().trim() + "%" } })
        }
        else if (arr[i] == "start_day") {
            queryTemp["create_at"] = { "OP.GTE": arr1[i] }
            // condition.push({"create_at" : {"OP.GTE" : arr1[i]}})
        }
        else {
            queryTemp[`${arr[i]}`] = arr1[i]
        }
        condition.push(queryTemp)
    }

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
        if (arr[i] == "past_time") {
            queryTemp[`create_at`] = { "OP.GTE": arr1[i] }
        }
        else if (arr[i] == "current_time") {
            queryTemp[`create_at`] = { "OP.LTE": arr1[i] }
        }
        else {
            queryTemp[`${arr[i]}`] = arr1[i]
        }

        condition.push(queryTemp)
    }
    const config = {
        where: {
            "OP.AND": condition
        },
    }

    return DBHelper.FindAll("orders", config)
}

var getAllOrderStatus = exports.getAllOrderStatus = async (query) => {
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
    if (query.status == "RESTOCK" || query.status == "PAID & RESTOCK") {
        const allProduct = await getOrderProduct({ order_id: query.order_id })

        for (let i = 0; i < allProduct.length; i++) {
            if (allProduct[i].is_variant) {
                const variant = await variantService.getVariantById(allProduct[i].variant_id)
                if (variant.length > 0) {
                    let remainQuantity = variant[0].quantity - allProduct[i].quantity
                    if (remainQuantity < 0) {
                        return "Fail"
                    }
                }
            }
            else {
                const product = await productService.findById(allProduct[i].product_id)
                if (product.length > 0) {
                    let remainQuantity = product[0].inventory - allProduct[i].quantity
                    if (remainQuantity < 0) {
                        return "Fail"
                    }
                }
            }
        }

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
        query.status = "CONFIRMED"
        newStatus = "CONFIRMED"
    }
    else if (query.status == "CREATED" || query.status == "PAID") {
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

    const createQuery = query

    query.status = newStatus
    //  {
    //     order_id: query.order_id,
    //     status: newStatus
    // }
    return DBHelper.insertData(createQuery, "order_status", true, "id")
}

exports.changeOrderStatusPaid = async (query) => {
    let newStatus
    if (query.status == "PRE-PAID") {
        newStatus = "PAID"
    }
    else if (query.status == "PREPAID & RESTOCK") {
        newStatus = "PAID & RESTOCK"
    }
    else {
        return null
    }

    const createQuery = query

    query.status = newStatus
    //  {
    //     order_id: query.order_id,
    //     status: newStatus
    // }
    return DBHelper.insertData(createQuery, "order_status", true, "id")
}

exports.CreateStatusdeleteOrder = async (query) => {

    // Return Data
    const status = await getAllOrderStatus({ order_id: query.order_id })
    if (status) {
     
        if (status[0].status != "PREPAID & RESTOCK" && status[0].status != "PAID & RESTOCK" && status[0].status != "RESTOCK") {
          
            const products = await getOrderProduct({ order_id: query.order_id })
            for (let i = 0; i < products.length; i++) {
                let data
        
                if (!products[i].is_variant) {
                    data = await productService.findById(products[i].product_id)
                    
                }
                else {
                    data = await variantService.getVariantById(products[i].variant_id)
                }
             
                if (data) {
                    if (data[0]) {
                        let query = {
                            id: products[i].product_id,
                            quantity: products[i].is_variant ? data[0].quantity + products[i].quantity : data[0].inventory + products[i].quantity,
                            is_variant: products[0].is_variant,
                            variant_id: products[0].variant_id
                        }
                        await productService.updateInventory(query)
                    }
                }
            }
        }
    }

    return DBHelper.insertData(query, "order_status", true, "id")
}

exports.RestoreOrderProduct = async (query) => {
    const products = await getOrderProduct({ order_id: query.order_id })
    for (let i = 0; i < products.length; i++) {
        let data
        if (!products[i].is_variant) {
            data = await productService.findById(products[i].product_id)
        }
        else {
            data = await variantService.getVariantById(products[i].variant_id)
        }
        if (data) {
            if (data[0]) {
                let query = {
                    id: products[i].product_id,
                    quantity: products[i].is_variant ? data[0].quantity - products[i].quantity : data[0].inventory - products[i].quantity,
                    is_variant: products[0].is_variant,
                    variant_id: products[0].variant_id
                }
                query.quantity = query.quantity >=0 ? query.quantity : 0
                await productService.updateInventory(query)
            }
        }
    }
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

async function getStorePaypalInfo(id) {
    try {
        const result = await db.query(`
                SELECT * 
                FROM store_paypal 
                WHERE (id = '${id}')
            `)
        if (result.rows) {
            return result.rows[0];
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getPaypalAccessToken = async (store_id) => {

    const GENERATE_ACCESS_TOKEN_URL = "https://api.sandbox.paypal.com/v1/oauth2/token"
    let storePayment = await getStorePaypalInfo(store_id);
    if (storePayment == null) {
        return null;
    } else {
        var accessTokenData = await fetch(GENERATE_ACCESS_TOKEN_URL, {
            method: 'post',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(storePayment.client_id + ":" + storePayment.secret_key).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'ignoreCache': 'true',
                'return_authn_schemes': 'true',
                'return_unconsented_scopes': 'true'

            })
        }).then(function (res) {
            return res.json();
        }).then(function (orderData) {
            return orderData;
        });
        return accessTokenData;
    }

}

exports.createPaypalOrder = async (store_id, productData, sumPrice, discount, order_id) => {
    if (!discount) {
        discount = 0;
    } else {
        discount = parseFloat(discount).toFixed(2);
    }

    var accessTokenData = await this.getPaypalAccessToken(store_id)
    if (accessTokenData == null) {
        return null;
    }
    let returnURL = await storeService.findById(store_id).then(res => res.store_link);
    var payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                items: productData.map((item) => {
                    return {
                        name: item.is_variant ? `${item.product_name} / ${item.variant_name}` : item.product_name,
                        description: "",
                        quantity: item.quantity,
                        unit_amount: {
                            currency_code: item.currency,
                            value: parseFloat(item.price).toFixed(2)
                        }
                    }
                }),
                amount: {
                    currency_code: "USD",
                    value: parseFloat(Number(sumPrice) - Number(discount)).toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: parseFloat(Number(sumPrice)).toFixed(2),
                        },
                        shipping: {
                            currency_code: "USD",
                            value: 0.00
                        },
                        shipping_discount: {
                            currency_code: "USD",
                            value: 0.00
                        },
                        discount: {
                            currency_code: "USD",
                            value: discount
                        }
                    }
                }
            }
        ],
        application_context: {
            return_url: `https://${returnURL}/orders?id=${order_id}`,
            cancel_url: `https://${returnURL}/orders?id=${order_id}`
        }
    }

    var data = JSON.stringify(payload);
    // console.log(data)
    return await fetch("https://api.sandbox.paypal.com/v2/checkout/orders", {
        method: "post",
        headers: {
            'Authorization': 'Bearer ' + accessTokenData.access_token,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: data
    }).then((response) => {
        return response.json()
    }).then((order) => {
        // console.log(order)
        return order
    });
}
exports.paypalCaptureOrder = async (store_id, paypal_order_id) => {
    var accessTokenData = await this.getPaypalAccessToken(store_id)
    if (accessTokenData == null) {
        return null
    }
    return await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${paypal_order_id}/capture`, {
        method: "post",
        headers: {
            'Authorization': 'Bearer ' + accessTokenData.access_token,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    })
        .then((response) => response.json())
}
exports.paypalCheckOrder = async (store_id, paypal_order_id) => {
    var accessTokenData = await this.getPaypalAccessToken(store_id)
    if (accessTokenData == null) {
        return null
    }
    return await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${paypal_order_id}`, {
        headers: {
            'Authorization': 'Bearer ' + accessTokenData.access_token,
            'Content-Type': 'application/json',
        }
    })
        .then(async (response) => {
            return await response.json()
        })
}
exports.paypalRefundOrder = async (store_id, refundLink, amount) => {
    var accessTokenData = await this.getPaypalAccessToken(store_id)
    if (accessTokenData == null) {
        return null
    }
    var payload = {
        amount: amount,
        invoice_id:  new Date().getTime(),
        note_to_payer: "Null"
    }
    var data = JSON.stringify(payload);
    return await fetch(refundLink, {
        method: "post",
        headers: {
            'Authorization': 'Bearer ' + accessTokenData.access_token,
            'Content-Type': 'application/json',
        },
        body: data
    })
        .then(async (response) => {
            return await response.json()
        })
}