const productService = require('./productService');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const http = require('../../const');

exports.createProduct = async (req, res) => {
    // create new product
    const ProductObj = req.body;
    const id = req.params.id
    let productQuery = req.body.product
    productQuery.store_id = id


    let productOptionQuery = req.body.option
    let variantQuery = req.body.variant

    //Create Product
    const newProduct = await productService.createProduct(productQuery);

    //Create Option
    let productId = newProduct.rows[0].id
    if (productOptionQuery) {
        for (let i = 0; i < productOptionQuery.length; i++) {
            let query = {
                "name": productOptionQuery[i].name,
                "product_id": productId
            }
            const newOption = await productOptionService.createDataOption(query)

            //Create Option Value
            for (let j = 0; j < productOptionQuery[i].value.length; j++) {
                let optionQuery = {
                    "name": productOptionQuery[i].name,
                    "value": productOptionQuery[i].value[j],
                    "product_id": productId,
                    "option_id": newOption.rows[0].id
                }
                const newOptionValue = await productOptionService.createDataOptionValue(optionQuery)
            }
            
        }
    }

    //Create Variant
    if (variantQuery) {
        for (let i = 0; i < variantQuery.length; i++) {
            let option_value_id = []
            let createVariantQuery = variantQuery[i]
            for (let j = 0; j < createVariantQuery.option_value.length; j++){
                let query = createVariantQuery.option_value[j]
                query.product_id = productId
                const findOptionValue = await productOptionService.findDataOptionValue(query)
                option_value_id.push(findOptionValue[0].id)
            }
            delete createVariantQuery.option_value
            createVariantQuery.option_value_id = option_value_id
            createVariantQuery.product_id = productId
            const createOptionValue = await productVariantService.createVariant(createVariantQuery)
        }
       
    }
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

exports.updateProduct = async (req, res) => {
    // create new product
    const ProductObj = req.body;
    const id = req.params.id

    let productQuery = req.body.product
    productQuery.id = id

    const newProduct = await productService.updateProduct(productQuery)
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