const pageService = require('./pageService');
const AWS = require('aws-sdk');
const http = require('../../const')

const s3 = new AWS.S3();

exports.create = async (req, res) => {
    const pageBody = req.body;
    const page = await pageService.createPage(pageBody);
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

exports.findPageByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const result = await pageService.findPageByStoreId(storeId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get pages successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    const result = await pageService.savePageContent(pageId, req.body);
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

exports.loadContent = async (req, res) => {
    const pageId = req.params.pageId;
    const content = await pageService.findPageById(pageId)
    res.status(http.Success).json(content);
}