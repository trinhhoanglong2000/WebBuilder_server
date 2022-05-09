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
    let query = {}
    query.id = req.params.id
    const result = await collectionService.findById(query)
    let productQuery = req.query
    if (result[0].id) {
        const listProducts = await productService.getProductsByCollectionId(result[0].id, productQuery);
        if (listProducts) result[0].listProducts = listProducts;
    }
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