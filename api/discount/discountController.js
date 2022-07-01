
const { query } = require('express');
const http = require('../../const');
const discountService = require('./discountService')
const dataService = require('../data/dataService')
exports.useDiscount = async (req, res) => {
    const data = req.body
    if (!data.store_id || !data.code || data.total_price == undefined || data.total_products == undefined|| !data.currency) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }
    const dataQuery = {
        store_id : data.store_id,
        code : data.code
    }
    
    
    const result = await discountService.findDiscount(dataQuery)

    if (result) {
        if (result.length == 1) {
            const currentTime = new Date()

            if (currentTime < result[0].start_at ||
                (currentTime > result[0].end_at && result[0].is_end) ||
                result[0].quantity == 0) {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    data: null,
                    message: "No Discount Available"
                })

            }
            else {

                const conditionPrice = await dataService.changeMoney({ from: result[0].currency, to: data.currency, price: result[0].condition })
                if ((result[0].condition_type == 1 && data.total_price < conditionPrice) ||
                    (result[0].condition_type == 2 && data.total_products < result[0].condition)) {

                    res.status(http.NotAcceptable).json({
                        statusCode: http.NotAcceptable,
                        data: result,
                        message: "Order isn't match with the discount requirement"
                    })
                }
                else {
                    res.status(http.Success).json({
                        statusCode: http.Success,
                        data: result,
                        message: "Use Discount Successfully"
                    })
                }

            }



        }
        else {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: null,
                message: "No Discount Found"
            })
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.updateDiscount = async (req, res) => {
    const discount = req.body;
    discount.id = req.params.id

    if (discount.code) {
        const check = await discountService.findDiscount({ store_id: discount.store_id, code: discount.code })
        if (check) {
            if (check.length > 0) {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    data: check,
                    message: "Already Taken Code"
                })
                return
            }
        }
        else {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server error!"
            })
            return
        }
    }
    const result = await discountService.updateDiscount(discount)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Update Discount succussfully"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.deleteDiscount = async (req, res) => {
    const query = {
        id: req.params.id
    }
    const result = await discountService.deleteDiscount(query)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Delete account successfully"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.generateCode = async (req, res) => {
    const result = await discountService.generateCode(req.body)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Generate code!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.checkCode = async (req, res) => {
    const data = req.body
    if (!data.store_id || !data.code) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
            message: "Bad Request"
        })
        return
    }

    const result = await discountService.findDiscount(data)
    if (result) {
        if (result.length > 0) {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: result,
                message: "Already Taken Code"
            })
        }
        else {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: null,
                message: "No Code Taken"
            })
        }

    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};