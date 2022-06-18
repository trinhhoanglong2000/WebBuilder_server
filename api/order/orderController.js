const orderService = require('./orderService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
const productService = require('../products/productService')
const mailService = require('../email/emailService')
exports.changeOrderStatus = async (req, res) => {
    const query = req.body
    query.order_id = req.params.id
    const result = await orderService.createOrderStatus(query)

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
                data: result,
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