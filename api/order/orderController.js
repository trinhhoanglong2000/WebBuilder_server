const orderService = require('./orderService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
const productService = require('../products/productService')
const emailService = require('../email/emailService')
const storeService = require('../stores/storeService')
const accountService = require('../accounts/accountService')
exports.changeOrderStatus = async (req, res) => {

    if (!req.body.store_id || !req.body.status) {
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

exports.deleteOrderStatus = async (req, res) => {
    if (!req.body.store_id) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }

    // let check = {
    //     id: req.body.store_id,
    //     user_id: req.user.id
    // }
    // let authen = await this.AuthenticateUserAndStore(req, res, check)
    // if (!authen) {
    //     return
    // }
    const query = req.body
    const storeId = query.store_id
    delete query["store_id"]
    query.order_id = req.params.id
    query.status = "DELETED"
    const result = await orderService.CreateStatusdeleteOrder(query)

    const storeData = await storeService.findById(storeId)
    const orderData = await orderService.getAllOrder({id: query.order_id})
    if (orderData.length) {
        let mailStoreQuery  = {
            store_id : storeId,
            subject: `Order #${query.order_id} has been delete`,
            receiver : `${orderData[0].email}`,
            html : `<p>We sorry to inform you that your order <a href=${storeData.store_link + "/orders/" + query.order_id}>#${query.order_id}</a> from ${storeData.name} has been deleted</p> <br>
            <p>You can still view your order status by click the link above or visit our website at  <a href=${storeData.store_link}>${storeData.store_link}</a>. We sorry for this inconvience</p>
            `
        }
        const account = await accountService.getUserInfo(storeData.user_id)
        let mailQuery  = {
            subject: `Order #${query.order_id} successfully change delete status`,
            receiver : `${account[0].email}`,
            html : `<p>Your stores order #${query.order_id} have been delete from store ${storeData.name}</p> <br>
            <p>You can view your order status by go to <a href=${process.env.MANAGEMENT_CLIENT_URL}>easymall.site</a>.</p>
            `
        }
    
        await emailService.adminSendMail(mailQuery)
        await emailService.sendMailFromStore(mailStoreQuery)
    }

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result.rows,
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

exports.restoreOrder = async (req, res) => {
    if (!req.body.store_id) {
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
    let result
    const status = await orderService.getAllOrderStatus({ order_id: req.params.id })
    if (!status) {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server Error"
        })
        return
    }

    if (status.length > 1) {
        if (status[0].status == "DELETED") {
            if (status[1].status == "CREATE" || status[1].status == "RESTOCK"){
                query.status = status[length-2]
                result = await orderService.changeOrderStatus(query)
            }
            else {
                query.status = "CONFIRMED"
                result = await orderService.CreateStatusdeleteOrder(query)
            }
        }
        else {
            res.status(http.NotAcceptable).json({
                statusCode: http.NotAcceptable,
                message: "Not Acceptable"
            })
            return
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server Error"
        })
        return
    }
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result.rows,
            message: "Successfully Change Status"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
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
            message: "No data found"
        })
    }
}

exports.deleteOrder = async (req, res) => {
    if (!req.body.store_id) {
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
    await orderService.deleteOrderStatus({ order_id: orderId })
    await orderService.deleteOrderProducts({ order_id: orderId })
    const result = await orderService.deleteOrder({ id: orderId })
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