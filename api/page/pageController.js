const pageService = require('./pageService');
const http = require('../../const')

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