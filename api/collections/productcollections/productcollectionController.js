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
exports.updateProductCollection = async (req, res) => {
    // update new collection
    const collectionId = req.body.collection.id
    const collectionObj = req.body.collection;
    const updateCollection = await collectionService.updateProductCollection(collectionObj)
    const productQuery = req.body.products
    // Update Product
    if (productQuery) {
        for (let i = 0; i < productQuery.length; i++) {
            let query = {
                "product_id": productQuery[i].id,
                "productcollection_id": collectionId
            }
            if (productQuery[i].update == "Add") {
                const newProduct = await collectionService.createProductandCollectionLink(query)
            } else {
                const deleteProduct = await collectionService.deleteProductandCollectionLink(query)
            }
        }
    }
    if (updateCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: updateCollection,
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
exports.deleteProductCollection = async (req, res) => {
    const id = req.params.id

    let productQuery = {}
    productQuery.id = id

    // let productRelativeQuery = {
    //     productcollection_id: id
    // }
    // const deleteProduct_ProductCollection = await productService.deleteProductRelative("product_productcollection", productRelativeQuery)
    const newProduct = await collectionService.deleteProduct(productQuery)
    if (newProduct) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newProduct,
            message: "Delete product successfully!"
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
    let resultQuery = {}
    if (result.length > 0) {
        if (result[0].description) {
            const content = await collectionService.getDescription(result[0].id)
            result[0].description = content
        }
        if (result[0].id) {
            resultQuery.collection = result[0]
            const listProducts = await productService.getProductsByCollectionId(result[0].id, productQuery);
            if (listProducts) {
                resultQuery.products = listProducts
            }
        }
    }
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: resultQuery,
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