const templateService = require('./templateService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
exports.useTemplate = async (req, res) => {
    const query = req.body
    query.template_id = req.params.id

    //CHECK ACCOUNT HAVE TEMPLATE
    const checkQuery = {
        user_id: query.user_id,
        template_id: query.template_id
    }
    const checkAccount = await templateService.getTemplateByAccount(checkQuery)
    if (checkAccount) {
        if (checkAccount.length > 0) {
            const result = await templateService.useTemplate(query)

            if (result) {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    data: result,
                    message: "Success Use Template"
                })
            }
            else {
                res.status(http.ServerError).json({
                    statusCode: http.ServerError,
                    data: result,
                    message: "Server Error!"
                })
            }
        }
        else {
            res.status(http.NotFound).json({
                statusCode: http.NotFound,
                message: "Account doesn't own this template!"
            })
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            data: result,
            message: "Server Error!"
        })
    }

}

exports.buyTemplate = async (req, res) => {
    const query = req.body
    query.template_id = req.params.id
    //CHECK ACCOUNT HAVE TEMPLATE
    const checkQuery = {
        user_id: query.user_id,
        template_id: query.template_id
    }
    const checkAccount = await templateService.getTemplateByAccount(checkQuery)
    if (checkAccount) {
        if (checkAccount.length == 0) {
            const result = await templateService.buyTemplate(query)
            if (result) {
                res.status(http.Success).json({
                    statusCode: http.Success,
                    data: result,
                    message: "Successfully Buy Template"
                })
            }
            else {
                res.status(http.ServerError).json({
                    statusCode: http.ServerError,
                    data: result,
                    message: "Server Error!"
                })
            }
        }
        else {
            res.status(http.NotFound).json({
                statusCode: http.NotFound,
                message: "Account's already owned this template!"
            })
        }
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            data: result,
            message: "Server Error!"
        })
    }

}

exports.createTemplate = async (req, res) => {
    const query = req.body
    const checkExist = await templateService.getTemplateById({ name: query.name })
    if (checkExist) {
        if (checkExist.length > 0) {
            res.status(http.NotAcceptable).json({
                statusCode: http.NotAcceptable,
                data: result,
                message: "Name Already Exist"
            })
            return
        }
    }
    const result = await templateService.createTemplate(query)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Success Return Data"
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

