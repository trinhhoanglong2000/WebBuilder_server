const storeService = require('./storeService');
const pageService = require('../page/pageService');
const http = require('../../const');

exports.createStore = async (req, res) => {
    // create new store
    const storeObj = req.body;
    storeObj.userId = req.user._id;
    const newStore = await storeService.createStore(storeObj);
    if (newStore) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newStore,
            message: "Create store successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllStores = async (req, res) => {
    const result = await storeService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all stores successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getStoreByUserId = async (req, res) => {
    const userId = req.user._id;
    const filter = req.query;
    const result = await storeService.findByUserId(userId, filter);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get stores successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getStoreById = async (req, res) => {
    const id = req.params.id;
    const result = await storeService.findById(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get store successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    const storeId = req.params.storeId;
    const result = await pageService.savePageContent(storeId, pageId, req.body);
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
    const storeId = req.params.storeId;
    const pageId = req.params.pageId;
    const content = await pageService.findPageById(storeId, pageId)
    res.status(http.Success).json(content);
}