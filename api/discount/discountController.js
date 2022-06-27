
const http = require('../../const');
const discountService = require('./discountService')
exports.useDiscount = async (req, res) => {
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
                res.status(http.Success).json({
                    statusCode: http.Success,
                    data: result,
                    message: "Use Discount Successfully"
                })
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
        const check = await discountService.findDiscount({ store_id : discount.store_id, code: discount.code })
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
    query = {
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