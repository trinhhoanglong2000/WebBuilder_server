const orderService = require('./orderService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
const productService = require('../products/productService')
const mailService = require('../email/emailService')
const storeService = require('../stores/storeService')
exports.changeOrderStatus = async (req, res) => {

    if (!req.body.store_id || !req.body.status){
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }

    let check = {
        id: req.body.store_id,
        user_id: req.user.id
    }
    let authen = await this.AuthenticateUserAndStore(req, res, check)
    if (!authen) {
        return
    }
    const query = req.body
    delete query["store_id"]
    query.order_id = req.params.id
    const result = await orderService.changeOrderStatus(query)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Successfully Change Status"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "No data found"
        })
    }
}

exports.getOrder = async (req, res) => {
    const orderId = req.params.id
    const returnData = {}
    const order = await orderService.getAllOrder({ id: orderId })
    if (order) {
        if (order.length == 0) {
            res.status(http.NotAcceptable).json({
                statusCode: http.NotAcceptable,
                message: "No data found"
            })
        }
    }
    returnData.order = order[0]

    //GET STATUS
    const status = await orderService.getAllOrderStatus({ order_id: orderId })
    if (status) {
        if (status.length == 0) {
            res.status(http.NotAcceptable).json({
                statusCode: http.NotAcceptable,
                data: result,
                message: "No data found"
            })
        }
    }
    returnData.status = status

    //GET PRODUCT
    const allProduct = await orderService.getOrderProduct({ order_id: orderId })
    for (let i = 0; i < allProduct.length; i++) {
        const productFound = await productService.findById(allProduct[i].product_id)
        if (productFound.length > 0) {
            allProduct[i].existed = true
        }
        else {
            allProduct[i].existed = false
        }
    }

    returnData.products = allProduct

    if (returnData) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: returnData,
            message: "Successfully Get Order"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "No data found"
        })
    }
}

exports.deleteOrder = async (req, res) => {
    if (!req.body.store_id){
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }
    let check = {
        id: req.body.store_id,
        user_id: req.user.id
    }
    let authen = await this.AuthenticateUserAndStore(req, res, check)
    if (!authen) {
        return
    }
    const orderId = req.params.id
    await orderService.deleteOrderStatus({order_id : orderId})
    await orderService.deleteOrderProducts({order_id : orderId})
    const result = await orderService.deleteOrder({id : orderId})
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Successfully Delete Order"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "No data found"
        })
    }
}

exports.AuthenticateUserAndStore = async (req, res, check) => {
    if (req.user) {
        let query = {
            id: check.id,
            user_id: check.user_id
        }
        console.log(query)
        const authenticateUser = await storeService.FindUserAndStore(query)
        if (!authenticateUser[0]) {
            res.status(http.Forbidden).json({
                statusCode: 403,
                message: "Forbiden!"
            })
            return
        }
        else {
            return authenticateUser
        }
    }
}