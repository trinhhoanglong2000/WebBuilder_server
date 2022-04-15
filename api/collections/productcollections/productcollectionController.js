const collectionService = require('./productcollectionService');
const productService = require('../../products/productService');
const http = require('../../../const');

exports.createCollection = async (req, res) => {
    // create new collection
    const collectionObj = req.body;
    const newCollection = await collectionService.createCollection(collectionObj);
    if (newCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newCollection,
            message: "Create collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllCollections = async (req, res) => {
    const result = await collectionService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all collections successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getcollectionById = async (req, res) => {
    const id = req.params.id;
    const result = await collectionService.findById(id);
    const listProducts = await productService.getProductsByCollectionId(id);
    if (listProducts) result.listProducts = listProducts;
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getcollection = async (req, res) => {
    const query = req.query
    console.log(query)
    const result = await collectionService.getData(query)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}
exports.getProductCollection = async (req, res) => {
    const query = req.query
    console.log(query)
    const result = await collectionService.getData(query)
    for (let i = 0; i < result.length; i++) {
        const listProducts = await productService.getProductsByCollectionId(result[i].id);
        if (listProducts) {
            result[i].listProducts = listProducts
        }
    }
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get Product collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}
exports.getProductsByCollectionId = async (req, res) => {
    const collectionId = req.params.id;
    const result = await productService.getProductsByCollectionId(collectionId);
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