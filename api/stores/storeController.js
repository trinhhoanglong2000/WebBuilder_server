const storeService = require('./storeService');
const pageService = require('../page/pageService');
const productService = require('../products/productService');
const productcollectionService = require('../collections/productcollections/productcollectionService');
const bannercollectionService = require('../collections/bannercollections/bannercollectionService');
const http = require('../../const');

exports.createStore = async (req, res) => {
    // create new store
    const storeObj = req.body;
    storeObj.userId = req.user.id;
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
    const userId = req.user.id;
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

exports.uploadCssFile = async (req, res) => {
    const id = req.params.storeId;
    const css_body = req.body;
    const result = await storeService.uploadCssFileForStore(id, css_body);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Upload file successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getCssFile = async (req, res) => {
    const id = req.params.storeId;
    const result = await storeService.getCssFileForStore(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get file successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getProductsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const result = await productService.getProductsByStoreId(storeId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getProductCollectionsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    console.log(storeId)
    const result = await productcollectionService.getCollectionsByStoreId(storeId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getBannerCollectionsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const result = await bannercollectionService.getCollectionsByStoreId(storeId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getInitDataStore = async (req, res) => {
    const storeId = req.params.id;
    const logoURL = storeService.getLogo(storeId);
    const listPagesId = pageService.getPagesByStoreId(storeId);
    const storeCssData = storeService.getCssFileForStore(storeId);
    const result = await Promise.all([logoURL, listPagesId, storeCssData]);

    console.log(result[2])

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                logoURL: result[0],
                listPagesId: result[1],
                storeCssData: result[2]
            },
            message: "Get products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};