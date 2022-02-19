const productService = require('./productService');
const http = require('../../const');

exports.createProduct = async (req, res) => {
    // create new product
    const ProductObj = req.body;
    const newProduct = await productService.createProduct(ProductObj);
    if (newProduct) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newProduct,
            message: "Create product successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllProducts = async (req, res) => {
    const result = await productService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getProductByPageId = async (req, res) => {
    const pageId = req.params.pageId;
    const result = await productService.findByPageId(pageId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get product successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getProductById = async (req, res) => {
    const id = req.params.id;
    const result = await productService.findById(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get product successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}