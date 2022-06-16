const pageService = require('./pageService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
const storeService = require('../stores/storeService');
const templateService = require('../template/templateService')
const { query } = require('express');
exports.checkURL = (req, res) => {
    const result = URLParser.checkValidURL(req.body.url)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "A valid URL Path"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "A invalid URL Path"
        })
    }
}
exports.create = async (req, res) => {
    const pageBody = req.body;
    const isExist = await pageService.getPageByName(pageBody.name, pageBody.store_id)
    if (isExist && isExist.length) {
        res.status(http.Conflict).json({
            statusCode: http.Conflict,
            message: "This page already exist!"
        })
        return
    }

    let templateName
    const store = await storeService.findById(pageBody.store_id)
    if (store) {
        const template = await templateService.getTemplateById({ id: store.template_id })
        if (template) {
            if (template.length > 0) {
                templateName = template[0].name
            } else {
                res.status(http.ServerError).json({
                    statusCode: http.ServerError,
                    message: "Server error!"
                })
                return
            }
        } else {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server error!"
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

    const page = await pageService.createPage(pageBody, "", false, templateName);
    if (page) {
        //await pageService.createHTMLFile(pageBody.store_id,page.rows[0].id)
    }
    if (page) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: page,
            message: "Create page successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.update = async (req, res) => {
    const pageBody = req.body;
    //await pageService.renameHTMLFile(req.body.id,req.body.name)
    const result = await pageService.updatePage(pageBody);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Update page successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.delete = async (req, res) => {
    const query = { id: req.params.id };
    //await pageService.removeHTMLFile(req.params.id)

    const result = await pageService.deletePage(query);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Delete successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getPageContentURL = async (req, res) => {
    const id = req.params.id;
    const result = await pageService.getPageContentURL(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get page content url successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};