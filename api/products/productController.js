const productService = require('./productService');

const http = require('../../const');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const productCollectionSerice = require('../collections/productcollections/productcollectionService')
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

exports.deleteProduct = async (req, res) => {
    const id = req.params.id

    let productQuery = {}
    productQuery.id = id

    let productRelativeQuery = {}
    productRelativeQuery.product_id = id
    const deleteProduct_Variant = await productService.deleteProductRelative("product_variant",productRelativeQuery)
    const deleteProduct_ProductOptionValue = await productService.deleteProductRelative("product_optionvalue",productRelativeQuery)
    const deleteProduct_ProductOption = await productService.deleteProductRelative("product_option",productRelativeQuery)
    const deleteProduct_ProductCollection = await productService.deleteProductRelative("product_productcollection",productRelativeQuery)
    const newProduct = await productService.deleteProduct(productQuery)
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
    let returnData = {}
    if (result) {
        returnData.product = result
        let resultOption = await productOptionService.getOptionFromProductId(id)
        if (resultOption) {
            for (let i = 0; i < resultOption.length; i++){
                const resultOptionValue = await productOptionService.getDataOptionValue(resultOption[i].id)
                resultOption[i].value = resultOptionValue
            }
            returnData.option = resultOption
        }
        let resultVariant = await productVariantService.getVariant(id)
        if (resultVariant){
            for (let i = 0; i < resultVariant.length; i++){
                let optionValue = []
                for (let j = 0 ; j < resultVariant[i].option_value_id.length; j++){
                    const resultOptionValue = await productOptionService.getDataOptionValueById(resultVariant[i].option_value_id[j])
                    optionValue.push(resultOptionValue[0])
                }
                resultVariant[i].option_value = optionValue
                delete resultVariant[i].option_value_id
            }
            
            returnData.variant = resultVariant
        }
        let resultCollection = await productCollectionSerice.getProductCollectionByProductId(id)
        returnData.collection = resultCollection

        //console.log(returnData)
        res.status(http.Success).json({
            statusCode: http.Success,
            data: returnData,
            message: "Get product successfully!"
        })
        return
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
    console.log("Foo")
}
