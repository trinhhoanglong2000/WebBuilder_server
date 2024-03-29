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

        if (result == "Fail") {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: false,
                message: "Fail to change restock status"
            })
        }
        else {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: result,
                message: "Successfully Change Status"
            })
        }

    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "No data found"
        })
    }
}

exports.changeOrderStatusPaid = async (req, res) => {

    if (!req.body.store_id || !req.body.status) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }

    const query = req.body
    delete query["store_id"]
    query.order_id = req.params.id
    const result = await orderService.changeOrderStatusPaid(query)

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
    const storeData = await storeService.findById(storeId)
    const orderData = await orderService.getAllOrder({ id: query.order_id })
    let paypalId = orderData[0].paypal_id

    // Payment refund start

    if (orderData[0].payment_method == 1) {
        let refundFlag = true; 
        const checkStatus = await orderService.paypalCheckOrder(storeId, paypalId).catch(e => null)
        if (checkStatus.status == "COMPLETED") {
            refundFlag = false
            const purchase_units = checkStatus.purchase_units[0]
            const capture = purchase_units.payments.captures[0];
            const amount = capture.amount
            const refundLinks = capture.links.find(item => item.rel === "refund")
            if (refundLinks) {
                const resRefund = await orderService.paypalRefundOrder(storeId, refundLinks.href, amount)
                if (resRefund) {
                    if (resRefund.id && res.status) {
                        refundFlag = true
                    }
                }
            }
        }
        if (!refundFlag) {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server Error"
            })
            return
        }
    }
    // Payment refund end

    const result = await orderService.CreateStatusdeleteOrder(query)
    if (orderData.length) {
        let mailStoreQuery = {
            store_id: storeId,
            subject: `Order #${query.order_id} has been delete`,
            receiver: `${orderData[0].email}`,
            html: `<p>We sorry to inform you that your order <a href=${storeData.store_link + "/orders?id=" + query.order_id}>#${query.order_id}</a> from ${storeData.name} has been deleted</p> <br>
            <p>You can still view your order status by click the link above or visit our website at  <a href=${storeData.store_link}>${storeData.store_link}</a>. We sorry for this inconvience</p>
            `
        }
        const account = await accountService.getUserInfo(storeData.user_id)

        const html = emailService.createUserMailString(`<p>Your stores order #${query.order_id} have been delete from store ${storeData.name}</p> <br>
        <p>You can view your order status by go to <a href=${process.env.MANAGEMENT_CLIENT_URL}>easymall.site</a>.</p>`)
        let mailQuery = {
            subject: `Order #${query.order_id} successfully change delete status`,
            receiver: `${account[0].email}`,
            html: html
        }

        emailService.adminSendMail(mailQuery)
        emailService.sendMailFromStore(mailStoreQuery)
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

    const storeId = req.body.store_id
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

            if (status[1].status == "CREATE" || status[1].status == "RESTOCK" || status[1].status == "PRE-PAID" || status[1].status == "PREPAID & RESTOCK" || status[1].status == "PAID & RESTOCK") {
                query.status = status[1].status
            }
            else {
                query.status = "CONFIRMED"
            }

            if (status[status.length - 1].status.includes("PAID")) {
                query.status = "PREPAID & RESTOCK"
            }
            if (status[1].status != "PREPAID & RESTOCK" && status[1].status != "PAID & RESTOCK" && status[1].status != "RESTOCK") {
                await orderService.RestoreOrderProduct({ order_id: query.order_id })
            }

            if (query.status = "PREPAID & RESTOCK") {
                let paypalOrderRes = null;
                const orderData = await Promise.all([orderService.getAllOrder({id : req.params.id}), orderService.getOrderProduct({order_id : req.params.id})])
                let orderQuery = { 
                    id: req.params.id,
                    store_id : storeId,
                    original_price : orderData[0][0].original_price,
                    discount_price : orderData[0][0].discount_price,
                }
                const productQuery = orderData[1]
                paypalOrderRes = await orderService.createPaypalOrder(orderQuery.store_id, productQuery, orderQuery.original_price, orderQuery.discount_price, orderQuery.id);
                if (paypalOrderRes.id) {
                    orderQuery.paypal_id = paypalOrderRes.id;
                }
                else {
                    res.status(http.ServerError).json({
                        statusCode: http.ServerError,
                        message: "Server error!"
                    })
                    return
                }

                await orderService.updateOrder(orderQuery)
            }
            result = await orderService.createOrderStatus(query)

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

exports.paypalCaptureOrder = async (req, res) => {
    const query = {
        order_id: req.params.orderId,
        store_id: req.params.storeId
    }

    const checkStatus = await orderService.paypalCheckOrder(query.store_id, query.order_id).catch(e => null);
    if (checkStatus) {
        if (checkStatus.status == "COMPLETED") {
            res.status(http.Success).json({
                statusCode: checkStatus.status,
                message: "Order completed!",
                dataPayment: checkStatus
            })
            return
        }
    }

    const result = await orderService.paypalCaptureOrder(query.store_id, query.order_id).catch(e => null)

    if (result) {
        if (result.status == "COMPLETED") {
            res.status(http.Success).json({
                statusCode: http.Success,
                message: "Order completed!",
                dataPayment: result
            })
        } else {
            let msgError = "Cant not find";
            let statuscode = http.BadRequest;
            if (result.name == "UNPROCESSABLE_ENTITY") {
                statuscode = http.NotAcceptable
                msgError = "SERVER_ERROR"
            } else if (result.name == "NOT_AUTHORIZED") {
                statuscode = http.Unauthorized
                msgError = "NOT_AUTHORIZED"
            }
            res.status(statuscode).json({
                statuscode: statuscode,
                message: msgError,
            })

        }

    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}
exports.paypalCheckOrder = async (req, res) => {
    const query = {
        order_id: req.params.orderId,
        store_id: req.params.storeId
    }
    const result = await orderService.paypalCheckOrder(query.store_id, query.order_id).catch(e => null)
    if (result) {
        if (result.status) {
            // TRANG THAI DON
            if (result.status == "CREATED") {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    paypalStatus: result.status,
                    approveLink: result.links.find(x => x.rel === "approve").href,
                    purchase_units: result.purchase_units
                })
            } else if (result.status == "APPROVED") {
                // Neu khach hang da thanh toan => Tien hanh capture de hoan tat don hang
                const result = await orderService.paypalCaptureOrder(query.store_id, query.order_id).catch(e => null)
                if (result) {
                    if (result.status == "COMPLETED") {
                        res.status(http.Success).json({
                            statusCode: http.Success,
                            message: "Order completed!",
                            dataPayment: result
                        })
                    } else {
                        let msgError = "Cant not find";
                        let statuscode = http.BadRequest;
                        if (result.name == "UNPROCESSABLE_ENTITY") {
                            statuscode = http.NotAcceptable
                            msgError = "SERVER_ERROR"
                        } else if (result.name == "NOT_AUTHORIZED") {
                            statuscode = http.Unauthorized
                            msgError = "NOT_AUTHORIZED"
                        }
                        res.status(statuscode).json({
                            statuscode: statuscode,
                            message: msgError,
                        })

                    }
                }
                else {
                    res.status(http.ServerError).json({
                        statusCode: http.ServerError,
                        message: "Server error!"
                    })
                }
            }
            else {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    paypalStatus: result.status,
                })
            }
        } else {

            // LOI KET NOI
            let msgError = "Cant not find";
            let statuscode = http.BadRequest;
            if (result.name == "UNPROCESSABLE_ENTITY") {
                statuscode = http.NotAcceptable
                msgError = "SERVER_ERROR"
            } else if (result.name == "NOT_AUTHORIZED") {
                statuscode = http.Unauthorized
                msgError = "NOT_AUTHORIZED"
            }
            res.status(statuscode).json({
                statuscode: statuscode,
                message: msgError,
            })
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}